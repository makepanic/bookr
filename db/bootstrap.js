var dbName = 'bookr',
    tableName = 'books',
    mongodb = require('mongodb'),
    mongoClient = mongodb.MongoClient;

module.exports = function (fn) {
    console.log('connecting to mongodb');

    mongoClient.connect("mongodb://localhost:27018/" + dbName, function(err, db) {
        var collection;

        if(!err) {
            // no error

            // create collection
            collection = db.collection(tableName);

            // call fn
            fn(null, {
                status: 'succesfully connected',
                db: db,
                collection: collection
            });
        } else {
            fn(err);
        }
    });
};