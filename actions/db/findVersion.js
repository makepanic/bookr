var Q = require('q');

module.exports = function (collections, isbns) {
    var deferred = Q.defer();

    collections.versions.find({
        'isbn.isbn10': isbns[0],
        'isbn.isbn13': isbns[1]
    }).toArray(function (err, data) {
        if (err) throw err;

        deferred.resolve(data);
    });

    return deferred.promise;
};