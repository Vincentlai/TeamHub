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
    filename: function(req, file, cb) {
        cb(null, req.session.user_id+"_"+Math.random())
    }
});
var upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    var mime = require('mime');

    console.log(req.body.file_name);
    console.log(mime.lookup(req.body.file_name));

    var file_name = req.body.file_name;
    var file_size = req.body.file_size;
    var team_id = req.body.team_id;
    var is_pic = req.body.is_pic;
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

    if(is_pic){
        is_pic = true;
    }else{
        is_pic = false;
    }

    models.Team.findOne({ _id: team_id }, function(err, team_obj) {

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
                    'msg': 'Permission denied'
                });
                return;
            }

            models.File.findOne({ $and: [
                { file_name: file_name },
                { team_id: team_id },
                { owner_user_id: user_id },
                { is_pic: false}
            ] }, function(err, file_obj) {

                if (file_obj) {
                    res.json({
                        'code': '-4',
                        'msg': 'You cannot upload the same file twice: ' + file_name
                    });
                    return;

                } else {


                    var newFile = new models.File({
                        team_id: team_id,
                        owner_user_id: user_id,
                        owner_nickname: nickname,
                        file_name: file_name,
                        file_size: file_size,
                        is_pic: is_pic
                    });

                    newFile.save(function(err, obj) {

                        if (!err) {

                            var newFileData = new models.FileData({
                                file_id: obj.id,
                                data: fs.readFileSync(req.file.path),
                                content_type: content_type
                            });

                            newFileData.save(function(err, file_data_obj) {

                                if (!err) {

                                    var upload_time = new Date();

                                    if(!is_pic){
                                        // push NEW to team
                                        team_obj.news.unshift(
                                            {
                                                user_id: user_id,
                                                user_nickname: nickname,
                                                action_name: 'uploaded',
                                                action_target: 'file',
                                                action_target_id: obj.id,
                                                target_team_id: team_id,
                                                target_team_name: team_obj.name,
                                            }
                                        );
                                        team_obj.save();
                                    }

                                    console.log("-> File uploaded successfully \n");

                                    res.json({
                                        "code": "1",
                                        "msg": "File is uploaded to " + team_obj.name,
                                        "file_id": obj.id,
                                        "file_name": obj.file_name,
                                        "owner_user_id": obj.owner_user_id,
                                        "owner_nickname": obj.owner_nickname,
                                        "file_size": obj.file_size,
                                        "time": upload_time.toDateString() + " " + upload_time.toTimeString().substring(0, 8),
                                        "is_pic": is_pic
                                    });
                                }

                            });
                        }
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
router.get('/download', function(req, res) {

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

    models.File.findOne({ _id: file_id }, function(err, file_obj) {

        if (!file_obj) {

            res.json({
                "code": "-2",
                "msg": "Invalid file_id"
            });

        } else {
            // check if user has permission to this file
            models.Team.findOne({ _id: file_obj.team_id }, function(err, team_obj) {

                if (team_obj) {

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
                            'msg': 'Permission denied'
                        });
                        return;

                    } else {

                        models.FileData.findOne({ file_id: file_id }, function(err, file_data_obj) {

                            if (file_data_obj) {
                                // send file over
                                res.contentType(file_data_obj.content_type);
                                res.send(file_data_obj.data);
                            }
                        });

                    }
                }
            });
        }
    });
});

router.delete('/delete', function(req, res) {

    var user_id = req.session.user_id;
    var nickname = req.session.nickname;
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

    models.File.findOne({ _id: file_id }, function(err, file_obj) {

        if (!file_obj) {

            res.json({
                "code": "-2",
                "msg": "Invalid file_id"
            });

        } else {
            // check if user has permission to this file
            models.Team.findOne({ _id: file_obj.team_id }, function(err, team_obj) {

                if (team_obj) {

                    // check if user is owner to this file
                    if (file_obj.owner_user_id == user_id) {

                        // push NEW to team
                        team_obj.news.unshift(
                            {
                                user_id: user_id,
                                user_nickname: nickname,
                                action_name: 'deleted',
                                action_target: 'file',
                                action_target_id: '',
                                target_team_id: team_obj._id,
                                target_team_name: team_obj.name
                            }
                        );
                        team_obj.save();

                        // delete file
                        file_obj.remove();

                        models.FileData.findOne({ file_id: file_id }, function(err, file_data_obj) {

                            if (file_data_obj) {
                                // delete file over
                                file_data_obj.remove();
                            }
                        });

                        res.json({
                            "code": "1",
                            "msg": "File has been deleted"
                        });
                    } else {
                        res.json({
                            "code": "-3",
                            "msg": "Permission denied"
                        });
                    }

                }
            });
        }
    });
});

router.get('/all', function(req, res) {

    var user_id = req.session.user_id;
    var team_id = req.query.team_id;

    if (!user_id) {
        res.json({
            "code": "-1",
            "msg": "No session, login required"
        });
        return;
    }

    if (!team_id) {
        res.json({
            "code": "-10",
            "msg": "Missing fields"
        });
        return;
    }

    models.Team.findOne({ _id: team_id }, function(err, team_obj) {

        if (!team_obj) {

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
                    'msg': 'Permission denied'
                });
                return;
            }

            models.File.find({ $and:[ {team_id: team_id}, {is_pic: false}] }, function(err, files) {

                if (files) {

                    var list = [];

                    for (var i = 0; i < files.length; i++) {

                        var upload_time = new Date(files[i]._id.getTimestamp());

                        list.push({
                            file_id: files[i]._id,
                            owner_user_id: files[i].owner_user_id,
                            owner_nickname: files[i].owner_nickname,
                            file_name: files[i].file_name, // full name including suffix
                            file_size: files[i].file_size, // in Bytes
                            time: upload_time.toDateString() + " " + upload_time.toTimeString().substring(0, 8)
                        });
                    }

                    res.json({
                        'code': '1',
                        'msg': 'Get file list successfully',
                        'files': list.reverse()
                    });

                } else {
                    res.json({
                        'code': '-4',
                        'msg': 'No file found'
                    });
                }
            });
        }
    });
});

module.exports = router;