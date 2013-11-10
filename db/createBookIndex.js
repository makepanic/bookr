var paraclete = require('paraclete');

function indexObject(obj){
    var objIndex,
        index = [];

    for(objIndex in obj) {
        if (obj.hasOwnProperty(objIndex)) {
            index = index.concat(indexProperty(obj[objIndex]));
        }
    }
    return index;
}
function indexArray(array) {
    return array;
}
function indexProperty(prop){
    var type = paraclete.Type.find(prop),
        index;

    //noinspection FallthroughInSwitchStatementJS
    switch (type){
        case 'string':
        case 'number':
        case 'boolean':
            index = [prop];
            break;
        case 'array':
            index = indexArray(prop);
            break;
        case 'object':
            index = indexObject(prop);
            break;
    }
    return index;
}

module.exports = function (book) {
    var index = [],
        forIndex = ['title', 'subtitle', 'authors', 'year', 'publisher', 'isbn10', 'textSnippet'];

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