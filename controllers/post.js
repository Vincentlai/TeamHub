var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.post = function (sess, team_id, text, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!team_id || !text) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    if (text.trim() == "") {
        callback({
            'code': "-1",
            'msg': "You cannot post empty post"
        });
        return;
    }

    models.Team.findOne({ _id: team_id }, function (err, team_obj) {

        if (!team_obj) {

            callback({
                'code': '-2',
                'msg': 'Invalid team_id'
            });
            return;


        } else {

            var newPost = new models.Post({
                nickname: sess.nickname,
                user_id: user_id,
                text: text,
                like: 0
            })

            newPost.save();

            callback({
                'code': '1',
                'msg': 'Post success'
            });
            return;
        }
    });
}