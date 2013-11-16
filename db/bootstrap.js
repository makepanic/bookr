var dbName,
    tableName,
    server,
    mongodb = require('mongodb'),
    nconf = require('nconf'),
    mongoClient = mongodb.MongoClient;

nconf.file({
    file: 'bookr-config.json'
});

server = nconf.get('database:server');
dbName = nconf.get('database:name');
tableName = nconf.get('database:tables:books');

module.exports = function (fn) {
    console.log('connecting to mongodb');

    mongoClient.connect("mongodb://" + server + "/" + dbName, function(err, db) {
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