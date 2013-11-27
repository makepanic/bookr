// aws setup
var bookrCrawler = require('bookr-crawler'),
    Q = require('q'),
    insertSuperBooksIfNotExists = require('../db/insertSuperBooksIfNotExists'),
    insertVersionsIfNotExists = require('../db/insertVersionsIfNotExists'),
    reduceBookList = require('../db/reduceBookList'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.search = function(collections) {
    return function (req, res) {
        var query = req.params.query;

        // check if request param query exists and if it's a string
        if (query && typeof req.params.query === 'string') {

            console.log('searching for', query);

            collections.superBooks.find({
                index: {
                    $regex: '.*' + query + '.*',
                    $options: 'i'
                }
            }).toArray(function (err, data) {
                if (err) throw err;

                res.send( reduceBookList.uniqueBooks(data));
            });

        } else {
            // has invalid query
            res.send('Error');
        }
    };
};

exports.crawl = function (collections) {

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

                // async insert if not exists
                Q.all([

                    insertSuperBooksIfNotExists(collections.superBooks, data.superBooks),
                    insertVersionsIfNotExists(collections.versions, data.versions)

                ]).then(function (superBooks, versions) {
                    // return superbooks to api result
                    res.send(superBooks);
                });

            });

        } else {
            res.send('invalid query parameter');
        }
    };
};