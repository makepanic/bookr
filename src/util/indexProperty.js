var paraclete = require('paraclete');
var indexProperty,
    indexArray,
    indexObject;

indexProperty = function (prop){
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
};

indexObject = function(obj){
    var objIndex,
        index = [];

    for(objIndex in obj) {
        if (obj.hasOwnProperty(objIndex)) {
            index = index.concat(indexProperty(obj[objIndex]));
        }
    }
    return index;
};
indexArray = function (array) {
    return array;
};

/**
 * creates an array of all fields for a value
 * @param {*} property to index
 * @returns {Array}
 */
module.exports = function (property) {
    return indexProperty(property);
};