/**
 * Created by Qiang Lai on 2016/10/28.
 */
var express = require('express');
var router = express.Router();
var user = require('../controllers/user.js');
/*
    all url here will start with /users
    For example:
        router.post('/login',.......)
        will match /users/login
 */
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

/* PATH: host_url:8080/user/register (POST)
 *
 * INPUT:
 * 'email'
 * 'password'
 * 'nickname'
 *
 * OUTPUT: JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *  1 -> Successfully registered, verify email
 * -1 -> Email already exists
 * -2 -> Invalid email format
 * -3 -> Password is too short
 * -10 -> Missing field
 */
router.post('/register',function(req, res)
{
    console.log("-> register called");
    var email = req.body.email;
    var password = req.body.password;
    var nickname = req.body.nickname;

    user.register(email, password, nickname, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/user/login (post)
 *
 * INPUT:
 * 'email'
 * 'password'
 *
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'session_id' : upon successful login a session id will be provided (only for debug purposes)
 *
 *
 *  1 -> Successfully logged in
 * -1 -> Email not registered
 * -2 -> Incorrect Password
 * -3 -> Email not verified
 * -10 -> Missing field
 */
router.post('/login',function(req, res)
{
    var sess = req.session;
    console.log("-> login called");
    console.log("** session_id: " + sess.id);

    var email = req.body.email;
    var password = req.body.password;

    user.login(sess,email,password,function (found){
        console.log(found);
        res.json(found);
        console.log("** user_id: " + sess.user_id);
    });
});

/* PATH: host_url:8080/user/logout (POST)
 *
 * INPUT: None
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'session_id' : a session id will be provided (only for debug purposes)
 *
 *  1 -> Successfully logged out
 *  -1 -> You haven't been logged in yet
 */
router.post('/logout', function(req, res)
{
    var sess = req.session;
    console.log("-> logout is called");
    console.log("** session_id: " + sess.id);
    console.log("** user_id: " + sess.user_id + " destroyed" + "\n");

    user.logout(sess, function(found) {
        res.json(found);
    });
});

/* PATH: host_url:8080/user/verify?id=12345678910 (GET)
 *
 * INPUT:
 * 'id' as param 
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *
 *  1 -> Successfully verified
 * -1 -> Invalid id
*/
router.get('/verify', function(req, res)
{
    console.log("-> verify called");

    if(req.param("id")){
        var id = req.param("id");
        user.verify(id,function (found){
            console.log(found);
            res.json(found);
        });

    }else{
        res.status(400);
        res.send('Invalid Request');
    }
});

/* PATH: host_url:8080/user/is-exist?email=youremail@gmail.com (GET)
 *
 * INPUT:
 * 'email' as param 
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *
 *  1 -> User found
 * -1 -> User not found
*/
router.get('/is-exist', function(req, res)
{
    console.log("-> is-exist called");

    if(req.param("email")){
        var email = req.param("email");
        user.isExist(email,function (found){
            console.log(found);
            res.json(found);
        });

    }else{
        res.status(400);
        res.send('Invalid Request');
    }
});

module.exports = router;