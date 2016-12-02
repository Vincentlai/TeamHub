var express = require('express');
var router = express.Router();
var user = require('../controllers/user.js');
var models = require('../models/models.js');
/*
 all url here will start with /users
 For example:
 router.post('/login',.......)
 will match /users/login
 */
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* PATH: host_url:8080/users/register (POST)
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
router.post('/register', function (req, res) {

    var email = req.body.email;
    var password = req.body.password;
    var nickname = req.body.nickname;

    user.register(email, password, nickname, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/users/login (post)
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
router.post('/login', function (req, res) {

    var sess = req.session;
    console.log("** session_id: " + sess.id);
    console.log(req.body.email);
    console.log(req.body.password);
    var email = req.body.email;
    var password = req.body.password;

    user.login(sess, email, password, function (found) {
        console.log(found);
        res.json(found);
        console.log("** user_id: " + sess.user_id);
    });
});

/* PATH: host_url:8080/users/logout (POST)
 *
 * INPUT: None
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'session_id' : a session id will be provided (only for debug purposes)
 *
 *   1 -> Successfully logged out
 *  -1 -> You haven't been logged in yet
 */
router.post('/logout', function (req, res) {

    var sess = req.session;
    console.log("** session_id: " + sess.id);

    user.logout(sess, function (found) {
        res.json(found);
    });
});

/* PATH: host_url:8080/users/verify?id=12345678910 (GET)
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
router.get('/verify', function (req, res) {

    if (req.param("id")) {
        var id = req.query.id;
        user.verify(id, function (found) {
            console.log(found);
            res.json(found);
        });

    } else {
        res.status(400);
        res.send('Invalid Request');
    }
});

/* PATH: host_url:8080/users/is-exist?email=youremail@gmail.com (GET)
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
router.get('/is_exist', function (req, res) {

    if (req.param("email")) {
        var email = req.query.email;
        user.isExist(email, function (found) {
            console.log(found);
            res.json(found);
        });

    } else {
        res.status(400);
        res.send('Invalid Request');
    }
});

/* URL: host_url:8080/users/my_info (GET)
 *
 * INPUT:
 * None
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'email'
 *  'nickname'
 *  'teams'
 *
 *  1 -> Get my info success
 * -1 -> User not found
 * -9 -> No session
 */
router.get('/my_info', function (req, res) {

    var sess = req.session;

    user.myInfo(sess, function (found) {
        //console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/users/cpass (POST)
 *
 * INPUT: 'old_pwd'
 *        'new_pwd'
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Changed password successfully
 *  -1 -> Incorrect old password
 *  -2 -> New password is too short
 *  -3 -> Error during change pwd
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/cpass', function (req, res) {
    var user_id = req.session.user_id;
    var opass = req.body.old_pwd;
    var npass = req.body.new_pwd;

    user.cpass(user_id, opass, npass, function (found) {
        res.json(found);
    });
});

/* User Avatar Upload */
/* 
 * Input: 'file': contains the file data
 *
 * Output: 'code' & 'msg'
 *  1 -> Upload Success
 * -9 -> No session, login required
 */
var multer = require('multer')
var fs = require('fs');

var storage = multer.diskStorage({
    destination: 'avatars/',
    filename: function (req, file, cb) {
        cb(null, req.session.user_id + '.jpg')
    }
});
var upload = multer({ storage: storage });

router.post('/upload_avatar', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    var user_id = req.session.user_id;
    if (user_id) {

        models.Avatar.findOne({ user_id: user_id }, function (err, avatar_obj) {

            if (avatar_obj) { // update avatar

                avatar_obj.data = fs.readFileSync(req.file.path);
                avatar_obj.save(function (err, obj) {
                    if (!err) {
                        console.log("-> avatar updated successfully \n");
                        res.json({
                            "code": "1",
                            "msg": "Avatar updated successfully"
                        });
                    }
                });

            } else { // first time upload avatar

                var newAvatar = new models.Avatar({
                    user_id: user_id,
                    data: fs.readFileSync(req.file.path),
                    content_type: "image/jpeg"
                });
                newAvatar.save(function (err, obj) {
                    if (!err) {
                        console.log("-> avatar uploaded successfully \n");
                        res.json({
                            "code": "1",
                            "msg": "Avatar uploaded successfully"
                        });
                    }
                });
            }
        });

    } else {
        console.log("-> avatar upload failed \n");
        res.json({
            "code": "-1",
            "msg": "No session, login required"
        });
    }
});

/* User Avatar Download */
/*
 * Login is required
 *
 * Input: 'user_id' : you may leave this field empty 
 *                    if you want the avatar of logged in user
 * 
 * Output: JPEG file
 */
router.get('/download_avatar', function (req, res) {

    var user_id = req.session.user_id;
    var target_user_id = req.query.user_id;

    if (user_id) {

        if(target_user_id){
            user_id = target_user_id;
        }

        models.Avatar.findOne({ user_id: user_id }, function (err, avatar_obj) {

            if (avatar_obj) {

                res.contentType(avatar_obj.content_type);
                res.send(avatar_obj.data);

            } else {
                var path = require('path');
                var appDir = path.dirname(require.main.filename);
                res.sendFile(appDir + "/public/images/default_avatar.jpg");
            }
        });

    } else {
        res.json({
            "code": "-9",
            "msg": "No session, login required"
        });
    }


});

module.exports = router;