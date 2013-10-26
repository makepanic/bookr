var specialRules = {
    isbn: function (book, storage) {
        storage.isbn10 = {
            'SS': book.isbn.isbn10
        };
        storage.isbn13 = {
            'SS': book.isbn.isbn13
        };
    },
    thumbnail: function (book, storage) {
        if (book.thumbnail.normal.length) {
            storage.thumbnailNormal = {
                'S': book.thumbnail.normal
            };
        }
        if (book.thumbnail.small.length) {
            storage.thumbnailSmall = {
                'S': book.thumbnail.small
            };
        }
    }
};

module.exports = function (book) {
    var prop,
        type,
        item = {},
        bwObj = {
            PutRequest: {
                Item: {}
            }
        };

    for (prop in book) {
        if (book.hasOwnProperty(prop)) {

            if (specialRules.hasOwnProperty(prop)) {
                // use special rule to apply book to dynamo object conversion
                specialRules[prop](book, bwObj.PutRequest.Item);
            } else {
                // simple type detection
                type = Object.prototype.toString.call(book[prop]) === '[object Array]' ? 'SS' : 'S';

                if (book[prop].length) {
                    // create item
                    item[prop] = {};
                    item[prop][type] = book[prop];

                    bwObj.PutRequest.Item = item;
                }

            }
        }
    }

    return bwObj;
};