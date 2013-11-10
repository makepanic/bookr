var tableName = 'bookr-books',
    mongodb = require('mongodb'),
    mongoClient = mongodb.MongoClient;

module.exports = function (fn) {
    console.log('connecting to mongodb');

    mongoClient.connect("mongodb://localhost:27018/exampleDb", function(err, db) {
        var collection;
        if(!err) {
            // no error

            // create collection
            collection = db.collection(tableName);

            // call fn
            fn(null, {
                status: 'succesfully connected',
                // TODO: remove db if not needed
                db: db,
                collection: collection
            });

        } else {
            fn(err);
        }
    });
};