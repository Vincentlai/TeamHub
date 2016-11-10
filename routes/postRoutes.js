var express = require('express');
var router = express.Router();
var post = require('../controllers/post.js');

router.post('/post', function (req, res) {

    console.log("-> post called");

    var text = req.body.text;
    var sess = req.session;
    var team_id = req.body.team_id;

    post.post(sess, team_id, text, function (found) {
        console.log(found);
        res.json(found);
    });
});

module.exports = router;