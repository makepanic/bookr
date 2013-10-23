/*global
 require
 */

'use strict';

// load packages
var express = require('express'),
    http = require('http'),

    // routes
    searchRoute = require('./routes/search'),

    // initialize express
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// route handler
app.get('/', function (req, res) {
    res.send('please us the /search/:provider api');
});
app.get('/search/:query', searchRoute.search);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});