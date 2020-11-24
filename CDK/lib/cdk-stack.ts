import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { MappingTemplate } from '@aws-cdk/aws-appsync';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
// import * as CodePipeline from '@aws-cdk/aws-codepipeline'
// import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
// import * as CodeBuild from '@aws-cdk/aws-codebuild'
// import * as lambda from '@aws-cdk/aws-lambda';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "AppSyncApis", {
      name: "appsync-api-lollyapps",
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    })

    new cdk.CfnOutput(this, "GraphQlAPIURL", {
      value: api.graphqlUrl
    })

    new cdk.CfnOutput(this, "API_KEY", {
      value: api.apiKey || ""
    })

    // const lolly_lambda = new lambda.Function(this, "LollyAddLambda", {
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset("lambda")
    // })

    // const lambda_data_source = api.addLambdaDataSource("LamdaLollyDataSource", lolly_lambda);

    // lambda_data_source.createResolver({
    //   typeName: "Mutation",
    //   fieldName: "createLolly"
    // })

    const lollyTable = new ddb.Table(this, 'lollyTables', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });

    const db_data_source = api.addDynamoDbDataSource('LollyDataSources', lollyTable);

    // lollyTable.grantFullAccess(lolly_lambda);

    // lolly_lambda.addEnvironment('Lolly_TABLE', lollyTable.tableName);

    db_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createLolly",
      requestMappingTemplate : MappingTemplate.fromString(`
        ## Automatically set the id if it's not passed in.
        $util.qr($context.args.put("id", $util.defaultIfNull($ctx.args.id, $util.autoId())))

        #set( $createdAt = $util.time.nowISO8601() )
        $util.qr($context.args.put("createdAt", $util.defaultIfNull($ctx.args.createdAt, $createdAt)))

        {
          "version" : "2018-05-29",
          "operation": "PutItem",
          "key": {
            "id":   $util.dynamodb.toDynamoDBJson($ctx.args.id)
          },
          "attributeValues": $util.dynamodb.toMapValuesJson($context.args)
        }
      `),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
    })

    db_data_source.createResolver({
      typeName: "Query",
      fieldName: "getLollies",
      requestMappingTemplate : MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan"
      }
      `),
        responseMappingTemplate: MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result.items)
        #end
      `)
    })


    db_data_source.createResolver({
      typeName: "Query",
      fieldName: "getLollyByID",
      requestMappingTemplate : MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "GetItem",
        "key" : {
            "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
        }
      }
      `),
        responseMappingTemplate: MappingTemplate.fromString(`
        #if( $context.error)
          $util.error($context.error.message, $context.error.type)
        #else
          $utils.toJson($context.result)
        #end
      `)
    })


    const myBucket = new s3.Bucket(this, "GATSBYbuckets", {
        versioned: true,
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,        
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "404.html"
    });

    const dist = new cloudfront.Distribution(this, 'myDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(myBucket) },
    });

    new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
      sources: [s3Deployment.Source.asset("../client/public")],
      destinationBucket: myBucket,
      distribution: dist
    });
    
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: dist.domainName
    });

    // // const cdkBuild = new CodeBuild.PipelineProject(this, 'CdkBuild', {
    // //   buildSpec: CodeBuild.BuildSpec.fromObject({
    // //     version: '0.2',
    // //     phases: {
    // //       install: {
    // //         "runtime-versions": {
    // //           "nodejs": 10
    // //         },
    // //         commands: [
    // //           'cd CDK',
    // //           'yarn'
    // //         ],
    // //       },
    // //       build: {
    // //         commands: [
    // //           'npm run build',
    // //           'npm run cdk synth -- -o dist'
    // //         ],
    // //       },
    // //     },
    // //     artifacts: {
    // //       'base-directory': 'dist',
    // //       files: [
    // //         'LambdaStack.template.json',
    // //       ],
    // //     },
    // //   }),
    // //   environment: {
    // //     buildImage: CodeBuild.LinuxBuildImage.STANDARD_2_0,
    // //   },
    // // });


    // const s3Build = new CodeBuild.PipelineProject(this, 's3Build', {
    //   buildSpec: CodeBuild.BuildSpec.fromObject({
    //     version: '0.2',
    //     phases: {
    //       install: {
    //         "runtime-versions": {
    //           "nodejs": 10
    //         },
    //         commands: [
    //           'cd client',
    //           'yarn',
    //           'npm i -g gatsby'
    //         ],
    //       },
    //       build: {
    //         commands: [
    //           'gatsby build',
    //           'ls'
    //         ],
    //       },
    //     },
    //     artifacts: {
    //       'base-directory': 'public',
    //       "discard-paths": "yes"
    //     },
    //   }),
    //   environment: {
    //     buildImage: CodeBuild.LinuxBuildImage.STANDARD_2_0,
    //   },
    // });

    // const lambdaBuild = new CodeBuild.PipelineProject(this, "LambdaBuild", {
    //   buildSpec: CodeBuild.BuildSpec.fromObject({
    //     version: "0.2",
    //     phases: {
    //       install: {
    //         "runtime-versions": {
    //           "nodejs": 10
    //         },
    //         commands: [
    //           'cd CDK',
    //           'cd lambda',
    //           "yarn"
    //         ]
    //       }
    //     },
    //     artifacts: {
    //       "base-directory": "lambda",
    //       "discard-paths": "yes"
    //     }
    //   }),
    //   environment: {
    //     buildImage: CodeBuild.LinuxBuildImage.STANDARD_4_0
    //   }
    // });

    // const sourceOutput = new CodePipeline.Artifact();
    // const cdkBuildOutput = new CodePipeline.Artifact('CdkBuildOutput');
    // const s3BuildOutput = new CodePipeline.Artifact();
    // const lambdaBuildOutput = new CodePipeline.Artifact('lambdaBuildOutput');


    // const pipline_main = new CodePipeline.Pipeline(this, 'LollyPipeline', {
    //   crossAccountKeys: false,
    //   restartExecutionOnUpdate: true,
    // });

    // pipline_main.addStage({
    //   stageName: 'Source',
    //   actions: [
    //     new CodePipelineAction.GitHubSourceAction({
    //       actionName: 'Checkout',
    //       owner: 'uzairbangee',
    //       repo: "lollyAppAWSCDK",
    //       oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN_AWS_SOURCE'),
    //       output: sourceOutput,
    //       trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
    //     }),
    //   ],
    // })

    // pipline_main.addStage({
    //   stageName: 'Build',
    //   actions: [
    //     new CodePipelineAction.CodeBuildAction({
    //       actionName: 's3Build',
    //       project: s3Build,
    //       input: sourceOutput,
    //       outputs: [s3BuildOutput],
    //     }),
    //     // new CodePipelineAction.CodeBuildAction({
    //     //   actionName: 'CDK_Build',
    //     //   project: cdkBuild,
    //     //   input: sourceOutput,
    //     //   outputs: [cdkBuildOutput],
    //     // }),
    //     // new CodePipelineAction.CodeBuildAction({
    //     //   actionName: 'LAMBDA_Build',
    //     //   project: lambdaBuild,
    //     //   input: sourceOutput,
    //     //   outputs: [lambdaBuildOutput],
    //     // }),
    //   ],
    // })

    // pipline_main.addStage({
    //   stageName: 'Deploy',
    //   actions: [
    //     new CodePipelineAction.S3DeployAction({
    //       actionName: 's3Build',
    //       input: s3BuildOutput,
    //       bucket: myBucket,
    //     }),
    //   ],
    // })

    // pipline_main.



  }
}