var bookrCrawler = require('bookr-crawler'),
    Q = require('q'),
    insertSuperBooksIfNotExists = require('../db/insertSuperBooksIfNotExists'),
    insertVersionsIfNotExists = require('../db/insertVersionsIfNotExists'),
    provider = [
        'google',
        //'isbndb',
        'openlibrary'
    ];


/**
 *
 * @param {String} query
 * @param {Object} collections
 * @returns {promise|Q.promise}
 */
module.exports = function (collections, query) {
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
};