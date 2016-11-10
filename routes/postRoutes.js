var express = require('express');
var router = express.Router();
var post = require('../controllers/post.js');

/* PATH: host_url:8080/posts/post (POST)
 *
 * INPUT: 'team_id' : team post to
 *        'text' : post content
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Post success
 *  -1 -> empty post
 *  -2 -> Invalid team_id
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
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