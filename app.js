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
    cookie: { maxAge: 7 * 24 * 3600 * 1000 }, // session expires after one week
    proxy: true,
    resave: true,
    saveUninitialized: true
});

app.use(session);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//create a new route file
var routes = require('./routes/index');// a route file manage the index page
var userRoutes = require('./routes/userRoutes');// a route file that manage the user api
var teamRoutes = require('./routes/teamRoutes'); 

//set prefix url of route file
app.use('/', routes);//back end do not need to change this file
app.use('/users', userRoutes);// all api url starts with /users will config in users.js
app.use('/teams', teamRoutes);

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