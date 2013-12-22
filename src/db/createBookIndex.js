var indexProperty = require('../util/indexProperty');

module.exports = function (book) {
    var index = [],
        forIndex = ['title', 'subtitle', 'authors', 'year', 'publisher', 'isbn', 'textSnippet'];

    forIndex.forEach(function (prop) {
        if (book.hasOwnProperty(prop)) {
            index = index.concat(indexProperty(book[prop]));
        }
    });

    index = index.filter(function(el) {
        if (el.length) {
            return el;
        }
    });

    return index;
};