// aws setup
var bookrCrawler = require('bookr-crawler'),
    createBookIndex = require('../db/createBookIndex'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.book = function(collection) {

    return function (req, res) {
        var id = req.params.id;

        // check if request param query exists and if it's a string
        if (id && typeof req.params.id === 'string') {

            console.log('searching for', id);

            collection.find({
                _id: id
            }).toArray(function (err, data) {
                    if (err) throw err;

                    res.send(data);
                });

        } else {
            // has invalid query
            res.send('Error');
        }
    };
};