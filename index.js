const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

function CORS(param) {
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(param),
    };
    return response;
}

var body = 'init';

exports.handler = (event, context, callback) => {

    if (event.body) {
        body = JSON.parse(event.body);
    }

    if (event.queryStringParameters.param && event.queryStringParameters.param == 'save') {
        const read = {
            TableName: 'mtd-table',
            Key: {
                "widget": event.queryStringParameters.widget
            }
        };

        docClient.get(read, function(err, data) {
            if (err) {
                callback(err, CORS("error1"));
            }
            else {
                const write = {
                    TableName: 'mtd-table',
                    Item: {
                        widget: event.queryStringParameters.widget,
                        data: body

                    }
                };
                docClient.put(write, function(err, data) {
                    if (err) {
                        callback(err, CORS("error3"));
                    }
                    else {
                        callback(null, CORS('MTD reset on ' + event.queryStringParameters.widget));
                    }
                });
            }
        });
    }
    else {
        const read = {
            TableName: 'mtd-table',
            FilterExpression: 'widget = :widget',
            ExpressionAttributeValues: { ':widget': event.queryStringParameters.widget }
        };
        docClient.scan(read, function(err, data) {
            if (err) {
                callback(err, CORS("error on scan method"));
            }
            callback(null, CORS(data));
        });
    }
};
