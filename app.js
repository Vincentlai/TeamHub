/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var connect = require('connect');
var port = process.env.PORT || 8080;
var path = require('path');

// Configuration 
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/views')));
app.use(express.static(__dirname + '/bower_components'));
app.use(connect.logger('dev')); 
app.use(connect.json()); 
app.use(connect.urlencoded());
app.use(cookieParser());

var session = require("express-session")({
    secret: "aacd4d61-b4ee-4790-9faa-48236449b9d6",
    cookie: { maxAge: 365 * 24 * 3600 * 1000 }, // session expires after one year
    proxy: true,
    resave: true,
    saveUninitialized: true
});

app.use(session);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routes
var routes = require('./routes/index');
var users = require('./routes/users');
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
var server = app.listen(port);
console.log('Server runs on port ' + port);