// aws setup
var ISBN = require('isbn').ISBN,
    crawl = require('../actions/crawl');

exports.search = function(collections) {
    return function (req, res) {
        var query = req.params.query,
            isbn,
            field,
            isbnFindObject = {};

        // check if request param query exists and if it's a string
        if (query && typeof req.params.query === 'string') {

            console.log('searching for', query);

            // check if query is isbn
            if (isbn = ISBN.parse(query)) {

                // build object that is used to find in collection
                isbnFindObject[isbn.isIsbn10() ? 'isbn.isbn10' : 'isbn.isbn13'] =  query.trim().toUpperCase();

                console.log('query is isbn, searching via isbn field', isbnFindObject);

                // find with isbnFindObject
                collections.versions.find(isbnFindObject).toArray(function (err, data) {
                    if (err) throw err;

                    if (data.length) {
                        // found version, find superBook
                        collections.superBooks.find({
                            '_id': data[0].superBook
                        }).toArray(function (err, data) {
                            if (err) throw err;
                            res.send(data);
                        });
                    } else {
                        // found no version, start crawling
                        console.log('no version found for isbn, starting crawling');
                        crawl(collections, query).then(function (superBooks) {
                            res.send(superBooks);
                        });

                    }

                });

            } else {
                // no isbn, search by query
                collections.superBooks.find({
                    index: {
                        $regex: '.*' + query + '.*',
                        $options: 'i'
                    }
                }).toArray(function (err, data) {
                    if (err) throw err;

                    res.send(data);
                });
            }
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

            crawl(collections, query).then(function (superBooks) {
                res.send(superBooks);
            });

        } else {
            res.send('invalid query parameter');
        }
    };
};