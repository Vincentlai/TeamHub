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

    var text = req.body.text;
    var team_id = req.body.team_id;
    var sess = req.session;
    var files = req.body.files;
    post.post(sess, team_id, text, files, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/posts/get_posts?team_id=123456789 (GET)
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
 *      'likes': number of likes
 *      'isLiked: is the current user liked this post or not
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

    var sess = req.session;
    var team_id = req.query.team_id;

    post.getPost(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/posts/delete?post_id=123456789 (DELETE)
 *
 * INPUT: 'post_id' : post to delete
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *      
 *   1 -> Delete post successfully
 *  -1 -> Invalid post_id
 *  -2 -> You are not the poster of this post
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.delete('/delete', function (req, res) {

    var sess = req.session;
    var post_id = req.query.post_id;

    post.delete(sess, post_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

router.post('/likeOrUnlike', function (req, res) {
    var post_id = req.body.post_id;
    var sess = req.session;
    var flag = req.body.flag;

    post.likeOrUnlike(sess, post_id, flag, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/posts/comment (POST)
 *
 * INPUT: 'post_id' : specific post to comment
 *        'comment' : your comment in text
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Comment success
 *  -1 -> Invalid post_id
 *  -2 -> Empty comment
 *  -2 -> You do not have permission to comment this post
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/comment', function (req, res) {

    var comment = req.body.comment;
    var post_id = req.body.post_id;
    var sess = req.session;

    post.comment(sess, post_id, comment, function (found) {
        console.log(found);
        res.json(found);
    });
});

router.get('/get_comments', function (req, res) {
    var sess = req.session;
    var post_id = req.query.post_id;

    post.getComments(sess, post_id, function (found) {
        console.log(found);
        res.json(found);
    });
});


module.exports = router;