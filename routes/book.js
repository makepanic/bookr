// aws setup
var findVersion = require('../actions/db/findVersion'),
    crawl = require('../actions/crawl'),
    bookrCrawler = require('bookr-crawler'),
    createBookIndex = require('../db/createBookIndex'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.book = function(collections) {

    return function (req, res) {
        var id = req.params.id;

        // check if request param query exists and if it's a string
        if (id && typeof req.params.id === 'string') {

            console.log('searching for', id);

            collections.superBooks.find({
                _id: id
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

exports.version = function(collections) {

    return function (req, res) {
        var isbn = req.params.isbn,
            isbns = [];

        // check if request param query exists and if it's a string
        if (isbn && typeof req.params.isbn === 'string') {

            isbns = isbn.split('-');
            if (isbns.length === 2){

                findVersion(collections, isbns).then(function (data) {
                    if (data.length) {
                        // found result
                        res.send(data[0]);
                    } else {
                        // search with isbn10 and find version again
                        crawl(collections, isbns[0]).then(function () {
                            findVersion(collections, isbns).then(function (data) {
                                if (data.length) {
                                    // found result
                                    res.send(data[0]);
                                } else {
                                    res.send('nothing found')
                                }
                            });
                        });
                    }
                });
            } else {
                res.send('invalid identifier');
            }
        } else {
            // has invalid query
            res.send('Error');
        }
    };
};