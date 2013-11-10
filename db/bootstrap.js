var tableName = 'bookr-books',
    mongodb = require('mongodb'),
    mongoClient = mongodb.MongoClient;

module.exports = function (fn) {
    console.log('connecting to mongodb');

    mongoClient.connect("mongodb://localhost:27018/exampleDb", function(err, db) {
        var collection,
            adminDb;

        if(!err) {
            // no error

            adminDb = db.admin();
            adminDb.command({
                setParameter: 1,
                textSearchEnabled: true
            }, function (err, data) {
                if (err) throw err;

                console.log('adminCommand executed', data);

                // create collection
                collection = db.collection(tableName);

                // call fn
                fn(null, {
                    status: 'succesfully connected',
                    db: db,
                    collection: collection
                });
            });


        } else {
            fn(err);
        }
    });
};