var express = require('express');
var router = express.Router();
var models = require('../models/models.js');

/* User Avatar Upload */
/* 
 * Input: 'file': contains the file data
 *        'file_name': full name of the file
 *
 * Output: 'code' & 'msg'
 *  1 -> Upload Success
 * -9 -> No session, login required
 */
var multer = require('multer')
var fs = require('fs');

var storage = multer.diskStorage({
    destination: 'tmp/',
    filename: function (req, file, cb) {
        cb(null, req.session.user_id)
    }
});
var upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), function (req, res, next) {

    console.log(req.body.file_name);
    var mime = require('mime');
    console.log(mime.lookup(req.body.file_name));
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
router.get('/download', function (req, res) {

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