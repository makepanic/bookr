// aws setup
var bookrCrawler = require('bookr-crawler'),
    Q = require('q'),
    ISBN = require('isbn').ISBN,
    insertSuperBooksIfNotExists = require('../db/insertSuperBooksIfNotExists'),
    insertVersionsIfNotExists = require('../db/insertVersionsIfNotExists'),
    reduceBookList = require('../db/reduceBookList'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

/**
 *
 * @param {String} query
 * @param {Object} collections
 * @returns {promise|Q.promise}
 */
function crawl(query, collections){
    var deferred = Q.defer();

    // has valid query
    bookrCrawler.mergeCrawl({
        provider: provider,
        query: query,
        prefer: 'google'
    }).then(function (data) {

        console.log('mergeCrawl done');

        // async insert if not exists
        Q.all([

            insertSuperBooksIfNotExists(collections.superBooks, data.superBooks),
            insertVersionsIfNotExists(collections.versions, data.versions)

        ]).then(function (result) {
            var superBooks = result[0],
                versions = result[1];

            console.log('inserting superBooks, versions done');

            // return superbooks to api result
            deferred.resolve(superBooks, versions);
        });

    });

    return deferred.promise;
}

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
                        crawl(query, collections).then(function (superBooks) {
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

            crawl(query, collections).then(function (superBooks) {
                res.send(superBooks);
            });

        } else {
            res.send('invalid query parameter');
        }
    };
};