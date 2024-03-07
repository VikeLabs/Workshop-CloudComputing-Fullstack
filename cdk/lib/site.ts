import * as cdk from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  OriginAccessIdentity,
  Distribution,
  SecurityPolicyProtocol,
  AllowedMethods,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { PolicyStatement, CanonicalUserPrincipal } from "aws-cdk-lib/aws-iam";
import {
  HostedZone,
  ARecord,
  RecordTarget,
  IHostedZone,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface SiteProps {
  zone: IHostedZone;
  url: string;
}

export class Site extends Construct {
  constructor(parent: Construct, id: string, props: SiteProps) {
    super(parent, id);
    const app_name = id;

    const cloudfrontOAI = new OriginAccessIdentity(
      this,
      `${app_name}cloudfront-OAI`,
      {
        comment: `OAI for ${id}`,
      }
    );

    const bucket = new Bucket(this, `${app_name}SiteBucket`, {
      bucketName: props.url,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const certificate = new Certificate(this, `${app_name}SiteCertificate`, {
      domainName: props.url,
      validation: CertificateValidation.fromDns(props.zone),
    });

    const distribution = new Distribution(this, `${app_name}SiteDistribution`, {
      certificate,
      defaultRootObject: "index.html",
      domainNames: [props.url],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    new ARecord(this, `${app_name}SiteAliasRecord`, {
      recordName: props.url,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: props.zone,
    });

    new BucketDeployment(this, `${app_name}BucketDeployment`, {
      sources: [Source.asset("../frontend/build")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
