var bookrCrawler = require('bookr-crawler');

/**
 *
 * @param {Array} books
 * @returns {Array}
 */
exports.uniqueBooks = function (books) {
    // TODO: remove duplicated model initialization

    var Book = bookrCrawler.Book,
        Merger = bookrCrawler.Merger,
        bookrBooks,
        uniqueBooks = {},
        resultList = [];

    bookrBooks = books.map(function (book) {
        return new Book(book);
    });

    var merger10 = new Merger('prefer-this', 'isbn10'),
        merger13 = new Merger('prefer-this', 'isbn13'),

        merge10ResultObject,
        merge10ResultArray,
        merge13ResultObject,
        merge13ResultArray;

    merge10ResultObject = merger10.mergeBooks([{
        key: 'dont-prefer-this',
        data: bookrBooks
    }]);

    merge10ResultArray = merger10.finalize(merge10ResultObject);

    merge10ResultArray = merge10ResultArray.map(function (book) {
        return new Book(book);
    });

    merge13ResultObject = merger13.mergeBooks([{
        key: 'dont-prefer-that',
        data: merge10ResultArray
    }]);

    merge13ResultArray = merger13.finalize(merge13ResultObject);

    // remove duplicated ids
    merge13ResultArray.forEach(function (resultItem) {
        resultItem['_id'] = resultItem.hash;
        delete resultItem.hash;

        if (!uniqueBooks.hasOwnProperty(resultItem['_id'])) {
            resultList.push(resultItem);
        }

        uniqueBooks[resultItem['_id']] = 1;
    });

    return resultList;
};