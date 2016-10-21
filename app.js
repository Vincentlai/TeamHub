/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var connect = require('connect');
var app = express();
var port = process.env.PORT || 8080;

// Configuration 
app.use(express.static(__dirname + '/public')); 
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

// Routes  
require('./routes/routes.js')(app);  

var server = app.listen(port);
console.log('Server runs on port ' + port);