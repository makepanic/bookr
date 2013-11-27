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

/**
 * creates an array of all fields for a value
 * @param {*} property to index
 * @returns {Array}
 */
module.exports = function (property) {
    return indexProperty(property);
}