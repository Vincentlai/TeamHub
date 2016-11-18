var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.post = function(sess, team_id, text, callback) {

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

    models.Team.findOne({ _id: team_id }, function(err, team_obj) {

        if (!team_obj) {

            callback({
                'code': '-2',
                'msg': 'Invalid team_id'
            });
            return;


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
                callback({
                    'code': '-2',
                    'msg': 'You are not belong to this team'
                });
                return;
            }

            var newPost = new models.Post({
                team_id: team_id,
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

exports.getPost = function(sess, team_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!team_id) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    models.Team.findOne({ _id: team_id }, function(err, team_obj) {

        if (!team_obj) {

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });
            return;


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
                callback({
                    'code': '-2',
                    'msg': 'You are not belong to this team'
                });
                return;
            }


            models.Post.find({ team_id: team_id }, function(err, posts) {

                if (!err) {

                    var respond = {};
                    respond.code = 1;
                    respond.msg = 'Get posts of ' + team_obj.name + ' successfully';

                    var posts_arr = [];

                    for (var i = 0; i < posts.length; i++) {

                        var post_time = new Date(posts[i]._id.getTimestamp());

                        // comments
                        var comments_arr = [];
                        var comments = posts[i].comments;
                        for (var j = 0; j < comments.length; j++) {

                            var comment_time = new Date(comments[j]._id.getTimestamp());

                            comments_arr.push({
                                'nickname': comments[j].nickname,
                                'time': comment_time.toDateString() + " " + comment_time.toTimeString().substring(0, 8)
                            });
                        }

                        posts_arr.push({
                            'post_id': posts[i]._id,
                            'nickname': posts[i].nickname,
                            'text': posts[i].text,
                            'like': posts[i].like,
                            'time': post_time.toDateString() + " " + post_time.toTimeString().substring(0, 8),
                            'comments': comments_arr
                        });
                    }

                    respond.posts = posts_arr.reverse();

                    callback(respond);
                    return;
                }
            });
        }
    });
}

exports.delete = function(sess, post_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!post_id) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    models.Post.findOne({ _id: post_id }, function(err, post_obj) {

        if (!post_obj) {

            callback({
                'code': '-1',
                'msg': 'Invalid post_id'
            });
            return;


        } else {

            // check if user is the creator of this team
            if (user_id == post_obj.user_id) {
                
                post_obj.remove();

                callback({
                    'code': '1',
                    'msg': 'Delete post successfully'
                });
            
            } else {

                callback({
                    'code': '-2',
                    'msg': 'You are not the poster of this post'
                });

            }

        }
    });
}

exports.comment = function(sess, post_id, comment, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!post_id || !comment) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    if (comment.trim() == "") {
        callback({
            'code': "-2",
            'msg': "Comment cannot be empty"
        });
        return;
    }

    models.Post.findOne({ _id: post_id }, function(err, post_obj) {

        if (!post_obj) {

            callback({
                'code': '-1',
                'msg': 'Invalid post_id'
            });
            return;


        } else {

            models.Team.findOne({ _id: post_obj.team_id }, function(err, team_obj) {

                var users = team_obj.users;
                var found = false;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id == user_id) {
                        found = true;
                        break;
                    }
                }

                if (found) {

                    post_obj.comments.push({
                        'user_id': user_id,
                        'nickname': sess.nickname,
                        'comment': comment
                    });

                    post_obj.save();

                    callback({
                        'code': '1',
                        'msg': 'Comment success'
                    });
                    return;

                } else {
                    callback({
                        'code': '-3',
                        'msg': 'You do not have access to this post'
                    });
                    return;
                }
            });

        }
    });
}