/**
 * Created by Qiang Lai on 2016/10/28.
 */
var express = require('express');
var router = express.Router();
var user = require('../user/user.js');
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
module.exports = router;