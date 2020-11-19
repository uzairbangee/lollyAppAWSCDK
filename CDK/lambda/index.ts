const AWS = require('aws-sdk');
const client = new AWS.DynamoDB.DocumentClient();
const shortid = require('shortid');

type AppSyncEvent = {
    info: {
        fieldName: string
    }
    arguments : {
        id: string
        to: string
        message: string
        from: string
        lollypath: string
        flavourTop: string
        flavourMiddle: string
        flavourBottom: string
    }
}

exports.handler = async (event: AppSyncEvent) => {
    const data = {
        ...event.arguments,
        id: shortid.generate()
    }
    const params = {
        TableName: process.env.Lolly_TABLE,
        Item : data
    }
    console.log(params);
    try{
        const result = await client.put(params).promise();
        console.log(result);
        return data;
    }
    catch(err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}