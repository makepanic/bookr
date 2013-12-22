var Q = require('q'),
    createSuperBookIndex = require('./createSuperBookIndex');

/**
 *
 * @param {Object} collection
 * @param {Array} superBooks
 * @returns {Function|promise|promise|Q.promise}
 */
module.exports = function (collection, superBooks) {
    var forInsert = [],
        mapPresentation = {},
        superIds = [],
        deferred = Q.defer();

    superBooks.forEach(function (superBook) {

        // remove hash
        delete superBook.hash;

        // add book id to ids array
        superIds.push(superBook._id);

        // tell mapPresentation that superBook id exists
        mapPresentation[superBook._id] = 1;
    });


    collection.find({
        _id: {
            $in: superIds
        }
    }).toArray(function (err, docs) {
        if (err) {
            throw err;
        }

        if (docs.length) {
            // found items with id in superIds

            docs.forEach(function (item) {
                if (!mapPresentation.hasOwnProperty(item._id)) {
                    // create superBook index
                    item.index = createSuperBookIndex(item);

                    forInsert.push(item);
                }
            });


        } else {
            // found no results

            forInsert = superBooks.map(function (item) {
                // create superBook index
                item.index = createSuperBookIndex(item);

                return item;
            });

        }

        if (forInsert.length) {
            // needs to insert data

            console.log('inserting', forInsert.length, 'items');
            collection.insert(forInsert, function (err, docs) {
                if(err) {
                    throw err;
                }

                console.log('insert done, returning crawled data');

                // send response
                deferred.resolve(superBooks);
            });
        } else {
            // no data to insert, return everything

            console.log('nothing inserted, returning crawled data');

            deferred.resolve(superBooks);
        }
    });

    return deferred.promise;
};