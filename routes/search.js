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
                var hashArray = [],
                    mapPresentation = {};

                console.log('inserting results', data.length);

                // rename hash to _id, delete hash
                data.forEach(function (item) {
                    item._id = item.hash;
                    hashArray.push(item._id);
                    delete item.hash;

                    mapPresentation[item._id] = item;
                });

                // find elements with created data
                collection.find({
                    _id: {
                        $in: hashArray
                    }
                }).toArray(function (err, docs) {
                        var forInsert = [];

                        if (err) throw err;

                        // compare found items with crawl result
                        docs.forEach(function (item) {
                            if (!mapPresentation.hasOwnProperty(item._id)) {
                                forInsert.push(item);
                            }
                        });

                        // check if items for inserting exist
                        if (forInsert.length) {

                            console.log('inserting', forInsert.length, 'items');

                            collection.insert(forInsert, function (err, docs) {
                                if(err) throw err;

                                console.log('insert done, returning crawled data');
                                res.send(data);

                            });
                        } else {

                            console.log('nothing inserted, returning crawled data');
                            res.send(data);

                        }
                    });
            });

        } else {
            res.send('invalid query parameter');
        }
    };
};