var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("-> a user visited the page");
    console.log("** session_id: " + req.session.id);
    res.render('index', { title: 'Home' });
});

module.exports = router;