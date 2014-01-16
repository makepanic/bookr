var mongodb = require('mongodb'),
    nconf = require('nconf');
var dbName,
    superBookTableName,
    versionTableName,
    server,
    mongoClient = mongodb.MongoClient;

nconf.file({
    file: 'bookr-config.json'
});

server = nconf.get('database:server');
dbName = nconf.get('database:name');
superBookTableName = nconf.get('database:tables:books');
versionTableName = nconf.get('database:tables:versions');

module.exports = function (fn) {
    console.log('connecting to mongodb');

    mongoClient.connect('mongodb://' + server + '/' + dbName, function(err, db) {
        var collection,
            versionCollection;

        if(!err) {
            // no error

            // create collection
            collection = db.collection(superBookTableName);
            versionCollection = db.collection(versionTableName);

            // call fn
            fn(null, {
                status: 'succesfully connected',
                db: db,
                collections: {
                    superBooks: collection,
                    versions: versionCollection
                }
            });
        } else {
            fn(err);
        }
    });
};