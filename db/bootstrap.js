var AWS,
    dynamodb,
    tableName = 'bookr-books';

AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-cred.json');
dynamodb = new AWS.DynamoDB();

module.exports = function (fn) {
    dynamodb.describeTable({
        TableName: tableName
    }, function (err, data) {
        if (err && err.name === 'ResourceNotFoundException') {

            // table does not exist, create it
            dynamodb.createTable({
                TableName: tableName,
                AttributeDefinitions: [{
                        AttributeName: 'hash',
                        AttributeType: 'S'
                    }],
                KeySchema: [{
                    AttributeName: 'hash',
                    KeyType: 'HASH'
                }],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 10
                }
            }, function (err, data) {
                if (err) throw err;

                fn(null, {
                    status: 'database created'
                })
            })

        } else if(err){
            throw err;
        } else {

            // no error
            fn(null, {
                status: 'database already exists'
            });
        }

    });

};