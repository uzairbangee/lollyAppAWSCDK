// import * as cdk from '@aws-cdk/core';
// import * as s3 from '@aws-cdk/aws-s3'
// import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
// import * as cloudfront from '@aws-cdk/aws-cloudfront';
// import * as origins from '@aws-cdk/aws-cloudfront-origins';
// import * as CodePipeline from '@aws-cdk/aws-codepipeline'
// import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
// import * as CodeBuild from '@aws-cdk/aws-codebuild'


// export interface PipelineProps {
//     github: {
//       owner: string
//       repository: string
//     }
// }

// export class PipelineControl extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props: PipelineProps) {
//     super(scope, id);

//     // The code that defines your stack goes here

//     const myBucket = new s3.Bucket(this, "GATSBYbucket", {
//         publicReadAccess: true,
//         removalPolicy: cdk.RemovalPolicy.DESTROY,        
//         websiteIndexDocument: "index.html"
//     });

//     const dist = new cloudfront.Distribution(this, 'myDistribution', {
//       defaultBehavior: { origin: new origins.S3Origin(myBucket) },
//     });

//     new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
//       sources: [s3Deployment.Source.asset("../client/public")],
//       destinationBucket: myBucket,
//       distribution: dist
//     });

//     const cdkBuild = new CodeBuild.PipelineProject(this, 'CdkBuild', {
//         buildSpec: CodeBuild.BuildSpec.fromObject({
//           version: '0.2',
//           phases: {
//             install: {
//               commands: 'yarn',
//             },
//             build: {
//               commands: [
//                 'npm run build',
//                 'npm run cdk synth -- -o dist'
//               ],
//             },
//           },
//           artifacts: {
//             'base-directory': 'dist',
//             files: [
//               'LambdaStack.template.json',
//             ],
//           },
//         }),
//         environment: {
//           buildImage: CodeBuild.LinuxBuildImage.STANDARD_2_0,
//         },
//       });
  
  
//       const s3Build = new CodeBuild.PipelineProject(this, 's3Build', {
//         buildSpec: CodeBuild.BuildSpec.fromObject({
//           version: '0.2',
//           phases: {
//             install: {
//               commands: [
//                 'cd ../client',
//                 'yarn',
//               ],
//             },
//             build: {
//               commands: 'gatsby build',
//             },
//           },
//           artifacts: {
//             'base-directory': 'client',
//             files: [
//               'node_modules/**/*',
//             ],
//           },
//         }),
//         environment: {
//           buildImage: CodeBuild.LinuxBuildImage.STANDARD_2_0,
//         },
//       });
  
//       const sourceOutput = new CodePipeline.Artifact();
//       const cdkBuildOutput = new CodePipeline.Artifact('CdkBuildOutput');
//       const s3BuildOutput = new CodePipeline.Artifact('Ls3BuildOutput');
  
//       const pipeline = new CodePipeline.Pipeline(this, 'Pipeline', {
//         pipelineName: 'Website',
//         restartExecutionOnUpdate: true,
//       })
  
//       new CodePipeline.Pipeline(this, 'Pipeline', {
//         stages: [
//           {
//             stageName: 'Source',
//             actions: [
//               new CodePipelineAction.GitHubSourceAction({
//                 actionName: 'Checkout',
//                 owner: props.github.owner,
//                 repo: props.github.repository,
//                 oauthToken: cdk.SecretValue.secretsManager('GitHubToken'),
//                 output: sourceOutput,
//                 trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
//               }),
//             ],
//           },
//           {
//             stageName: 'Build',
//             actions: [
//               new CodePipelineAction.CodeBuildAction({
//                 actionName: 's3_Build',
//                 project: s3Build,
//                 input: sourceOutput,
//                 outputs: [s3BuildOutput],
//               }),
//               new CodePipelineAction.CodeBuildAction({
//                 actionName: 'CDK_Build',
//                 project: cdkBuild,
//                 input: sourceOutput,
//                 outputs: [cdkBuildOutput],
//               }),
//             ],
//           },
//           {
//             stageName: 'Deploy',
//             actions: [
//               new CodePipelineAction.S3DeployAction({
//                 actionName: 'Website',
//                 input: s3BuildOutput,
//                 bucket: myBucket,
//               }),
//             ],
//           },
//         ],
//       });

//     new cdk.CfnOutput(this, "CloudFrontURL", {
//       value: dist.domainName
//     });

//   }
// }