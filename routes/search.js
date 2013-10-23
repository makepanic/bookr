var bookrCrawler = require('bookr-crawler'),
    provider = [
        'google',
        'isbndb',
        'openlibrary'
    ];

exports.search = function (req, res) {
    var query = req.params.query,
        inDb = false;

    // check if request param query exists and if it's a string
    if (query && typeof req.params.query === 'string') {

        // TODO: check for db results
        if (inDb) {

            res.send('db results');

        } else {
            // has valid query
            bookrCrawler.mergeCrawl({
                provider: provider,
                query: query,
                prefer: 'google'
            }).then(function (data) {

                // TODO: store in database

                // return data
                res.send(data);
            });
        }

    } else {
        // has invalid query
        res.send('Error');
    }
};