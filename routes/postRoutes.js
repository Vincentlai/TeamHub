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
 *  -1 -> Empty post
 *  -2 -> Invalid team_id
 *  -3 -> You are not belong to this team
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

/* PATH: host_url:8080/posts/get_posts (GET)
 *
 * INPUT: 'team_id' : team to get all posts
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'posts' : (from new to old)
 * 
 *      'post_id': id of each post
 *      'nickname': publisher name
 *      'text': content
 *      'like': number of likes
 *      'time': date_time posted
 *      'comments': [{ (from old to new)
 *              nickname: commenter nickname
 *              time: date_time commented }]
 *      
 *   1 -> Get posts successfully
 *  -1 -> Invalid team_id
 *  -2 -> You are not belong to this team
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.get('/get_posts', function (req, res) {

    console.log("-> get_posts called");

    var sess = req.session;
    var team_id = req.param("team_id");

    post.getPost(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

module.exports = router;