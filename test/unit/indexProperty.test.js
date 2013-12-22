var indexProperty = require('../../src/util/indexProperty');

/**
 * Test indexPorperty method
 * @param test
 */
exports.testIndexProperty = function (test) {
    var forIndexing = {
        foo: 'bar',
        arr: [1,2],
        arr2: [0],
        bool: true,
        und: undefined,
        val: -1
    };

    test.deepEqual(indexProperty(forIndexing),
        ['bar', 1, 2, 0, true, undefined, -1], 'indexProperty works as expected');

    test.done();
};