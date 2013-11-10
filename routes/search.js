// aws setup
var bookrCrawler = require('bookr-crawler'),
    createBookIndex = require('../db/createBookIndex'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.search = function(collection) {

    return function (req, res) {
        var query = req.params.query;

        // check if request param query exists and if it's a string
        if (query && typeof req.params.query === 'string') {

            console.log('searching for', query);

            collection.find({
                index: {
                    $regex: '.*' + query + '.*',
                    $options: 'i'
                }
            }).toArray(function (err, data) {
                if (err) throw err;

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
        var query = req.params.query;

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

                        if (docs.length) {
                            // compare found items with crawl result
                            docs.forEach(function (item) {
                                if (!mapPresentation.hasOwnProperty(item._id)) {
                                    // modify item and create keywords field
                                    item.index = createBookIndex(item);
                                    console.log('inserting with', item.index);

                                    forInsert.push(item);
                                }
                            });
                        } else {

                            forInsert = data.map(function (item, index) {
                                item.index = createBookIndex(item);
                                return item;
                            });
                        }

                        // check if items for inserting exist
                        if (forInsert.length) {

                            console.log('inserting', forInsert.length, 'items');
                            collection.insert(forInsert, function (err, docs) {
                                if(err) throw err;

                                console.log('insert done, returning crawled data');

                                // remove index from response data
                                data.forEach(function (el) {
                                    delete el.index;
                                });

                                // send response
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