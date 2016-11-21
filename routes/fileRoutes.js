var express = require('express');
var router = express.Router();
var models = require('../models/models.js');

/* File Upload */
/* 
 * Input: 'file': contains the file data
 *        'file_name': full name of the file
 *        'file_size': in Bytes
 *        'team_id' : which team to upload to
 *
 * Output: 'code' & 'msg'
 *  1 -> Upload Success
 * -2 -> Invalid team_id
 * -3 -> No permission
 * -9 -> No session, login required
 * -10 -> Missing fields
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
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    var mime = require('mime');

    console.log(req.body.file_name);
    console.log(mime.lookup(req.body.file_name));

    var file_name = req.body.file_name;
    var file_size = req.body.file_size;
    var team_id = req.body.team_id;
    var content_type = mime.lookup(req.body.file_name);

    var user_id = req.session.user_id;
    var nickname = req.session.nickname;

    if (!user_id) {
        console.log("-> file upload failed 0\n");
        res.json({
            "code": "-1",
            "msg": "No session, login required"
        });
        return;
    }

    if (!file_name || !file_size || !team_id) {
        console.log("-> file upload failed 1\n");
        res.json({
            "code": "-10",
            "msg": "Missing fields"
        });
        return;
    }

    models.Team.findOne({ _id: team_id }, function (err, team_obj) {

        if (!team_obj) {
            console.log("-> file upload failed 2\n");
            res.json({
                "code": "-2",
                "msg": "Invalid team_id"
            });

        } else {

            // check if user is belong to this team
            var found = false;
            for (var i = 0; i < team_obj.users.length; i++) {
                if (team_obj.users[i].id == user_id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log("-> file upload failed 3\n");
                res.json({
                    'code': '-3',
                    'msg': 'You are not belong to this team'
                });
                return;
            }

            var newFile = new models.File({
                team_id: team_id,
                owner_user_id: user_id,
                owner_nickname: nickname,
                file_name: file_name,
                file_size: file_size,
                data: fs.readFileSync(req.file.path),
                content_type: content_type
            });

            newFile.save(function (err, obj) {

                if (!err) {
                    console.log("-> File uploaded successfully \n");
                    res.json({
                        "code": "1",
                        "msg": "File is uploaded to " + team_obj.name
                    });
                }
            });
        }
    });
});

/* Single File Download */
/*
 * Login is required
 *
 * Input: 'file_id' : team to get files from
 * 
 * Output: one single file of any kind
 */
router.get('/download', function (req, res) {

    var user_id = req.session.user_id;
    var file_id = req.query.file_id;

    if (!user_id) {
        res.json({
            "code": "-1",
            "msg": "No session, login required"
        });
        return;
    }

    if (!file_id) {
        res.json({
            "code": "-10",
            "msg": "Missing fields"
        });
        return;
    }

    models.File.findOne({ _id: file_id }, function (err, file_obj) {

        if (!file_obj) {

            res.json({
                "code": "-2",
                "msg": "Invalid file_id"
            });

        } else {
            // send file over
            res.contentType(file_obj.content_type);
            res.send(file_obj.data);

        }
    });
});

// TODO: get file list for one team

// TODO: Check whether file already exist
//
//
//
//
//
//
//
//
//
//

module.exports = router;