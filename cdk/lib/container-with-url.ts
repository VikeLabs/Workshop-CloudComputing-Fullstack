import { Duration } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ARecord, RecordTarget, IHostedZone } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

interface ContainerWithUrlProps {
  image: DockerImageAsset;
  zone: IHostedZone;
  url: string;
  prefix: string;
}

export class ContainerWithUrl extends Construct {
  constructor(parent: Construct, id: string, props: ContainerWithUrlProps) {
    super(parent, id);

    // At least 2 AZ required
    const vpc = new Vpc(this, `${props.prefix}ApplicationVpc`, { maxAzs: 2 });

    const cluster = new Cluster(this, `${props.prefix}Cluster`, {
      vpc,
    });

    const cert = new Certificate(this, `${props.prefix}ContainerUrlCert`, {
      domainName: props.url,
      validation: CertificateValidation.fromDns(props.zone),
    });

    // Create a load-balanced Fargate service and make it public
    const service = new ApplicationLoadBalancedFargateService(
      this,
      `${props.prefix}ApplicationFargateService`,
      {
        cluster: cluster,
        cpu: 256,
        desiredCount: 1,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(props.image),
          containerPort: 443,
        },
        idleTimeout: Duration.seconds(4000),
        memoryLimitMiB: 512,
        publicLoadBalancer: true,
        // sslPolicy: SslPolicy.RECOMMENDED_TLS,
        certificate: cert,
      }
    );

    new ARecord(this, `${props.prefix}ContainerUrlARecord`, {
      recordName: props.url,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(service.loadBalancer)
      ),
      zone: props.zone,
    });
  }
}
