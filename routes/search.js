// aws setup
var bookrCrawler = require('bookr-crawler'),
    bookToBatchWriteObject = require('../db/bookToBatchWriteObject'),
    tableName = 'bookr-books',
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.search = function(collection) {

    return function (req, res) {
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
};

exports.crawl = function (collection) {

    return function(req, res) {
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

                console.log('inserting results', data.length);
                collection.insert(data, function (err, docs) {
                    console.log('insert done', docs);
                    res.send(docs);
                });

            });

        } else {
            res.send('invalid query parameter');
        }
    };
};