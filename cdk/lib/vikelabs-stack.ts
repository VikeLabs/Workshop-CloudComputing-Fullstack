import * as cdk from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { ContainerWithUrl } from "./container-with-url";
import { Site } from "./site";
import path = require("path");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: "brennanmcmicking.net",
    });

    new Site(this, "VikeLabsWorkshop", {
      zone,
      url: "vl.brennanmcmicking.net",
    });

    const flaskImage = new DockerImageAsset(this, "FlaskImage", {
      directory: path.join("..", "rest-backend"),
    });

    new ContainerWithUrl(this, "FlaskContainer", {
      zone: zone,
      image: flaskImage,
      url: "vlapi.brennanmcmicking.net",
      prefix: "Flask",
    });

    const wsImage = new DockerImageAsset(this, "WsImage", {
      directory: path.join("..", "ws-backend"),
    });

    new ContainerWithUrl(this, "WsContainer", {
      zone,
      image: wsImage,
      url: "vlws.brennanmcmicking.net",
      prefix: "WebSocket",
    });
  }
}
