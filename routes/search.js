// aws setup
var AWS,
    dynamodb,
    bookrCrawler = require('bookr-crawler'),
    bookToBatchWriteObject = require('../db/bookToBatchWriteObject'),
    tableName = 'bookr-books',
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-cred.json');
dynamodb = new AWS.DynamoDB();

exports.search = function (req, res) {
    var query = req.params.query,
        inDb = false;

    // check if request param query exists and if it's a string
    if (query && typeof req.params.query === 'string') {

        // TODO: check for db results
        dynamodb.scan({
            TableName: tableName,
            Limit: 10,
            AttributesToGet: [
                'hash',
                'authors',
                'isbn10',
                'isbn13',
                'publisher',
                'subtitle',
                'textSnipper',
                'thumbnailNormal',
                'thumbnailSmall',
                'title',
                'year'
            ],
            ScanFilter: {
                index: {
                    AttributeValueList: [{
                        "S": query.toUpperCase()
                    }],
                    ComparisonOperator: 'CONTAINS'
                }
            }
        }, function (err, data) {
            if (err) throw err;

            console.log(data);
            res.send(data);
        });
    } else {
        // has invalid query
        res.send('Error');
    }
};

exports.crawl = function (req, res) {
    var query = req.params.query,
        inDb = false;

    // check if request param query exists and if it's a string
    if (query && typeof req.params.query === 'string') {

        // has valid query
        bookrCrawler.mergeCrawl({
            provider: provider,
            query: query,
            prefer: 'google'
        }).then(function (data) {

            var key,
                book,
                batchWriteItems = [];

            // build dynamodb array out of all the books
            for (key in data) {
                if(data.hasOwnProperty(key)) {
                    book = data[key];
                    batchWriteItems.push(bookToBatchWriteObject(book));
                }
            }

            dynamodb.batchWriteItem({
                RequestItems: {
                    'bookr-books': batchWriteItems
                }
            }, function (err, dData) {
                if (err) throw err;

                console.log(dData);

                // return data
                res.send(data);
            });
        });

    } else {
        res.send('invalid query parameter');
    }
};