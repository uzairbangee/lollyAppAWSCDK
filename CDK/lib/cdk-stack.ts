import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { MappingTemplate } from '@aws-cdk/aws-appsync';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

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

    const lollyTable = new ddb.Table(this, 'lollyTables', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });

    const db_data_source = api.addDynamoDbDataSource('LollyDataSources', lollyTable);

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
      fieldName: "getLollyByPath",
      requestMappingTemplate : MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Query",
        "index" : "lollypath-index",
        "query" : {
          "expression": "lollypath = :lollypath",
          "expressionValues" : {
            ":lollypath" : $util.dynamodb.toDynamoDBJson($context.arguments.lollypath)
          }
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


    const myBucket = new s3.Bucket(this, "GATSBYbucket", {
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,        
        websiteIndexDocument: "index.html"
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

  }
}