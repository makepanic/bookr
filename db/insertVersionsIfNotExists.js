var Q = require('q'),
    createBookIndex = require('../db/createBookIndex');

/**
 *
 * @param {Object} collection
 * @param {Array} versions
 * @returns {Function|promise|promise|Q.promise}
 */
module.exports = function (collection, versions) {
    var forInsert = [],
        mapPresentation = {},
        versionHashes = [],
        deferred = Q.defer();


    versionHashes = versions.map(function (version) {

        mapPresentation[version.hash] = 1;

        return version.hash;
    });

    collection.find({
        _id: {
            $in: versionHashes
        }
    }).toArray(function (err, docs) {
        if (err) throw err;

            if (docs.length) {
                docs.forEach(function (item) {
                    if (!mapPresentation.hasOwnProperty(item.hash)) {
                        // create superBook index
                        item.index = createBookIndex(item);
                        forInsert.push(item);
                    }
                });
            } else {
                // found no results
                forInsert = versions.map(function (item) {
                    // create superBook index
                    item.index = createBookIndex(item);

                    return item;
                });
            }

            if (forInsert.length) {
                // needs to insert data

                console.log('inserting', forInsert.length, 'items');
                collection.insert(forInsert, function (err, docs) {
                    if(err) throw err;

                    console.log('insert done, returning crawled data');

                    // send response
                    deferred.resolve(versions);
                });
            } else {
                // no data to insert, return everything

                console.log('nothing inserted, returning crawled data');

                deferred.resolve(versions);
            }
    });


    return deferred.promise;
}