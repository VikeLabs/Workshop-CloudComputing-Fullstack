#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/vikelabs-stack";

const app = new cdk.App();
new CdkStack(app, "VikeLabsDemoStack", {
  env: { account: "446708209687", region: "us-east-1" },
});
