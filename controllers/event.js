var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.create = function (sess, team_id, title, description, start, end, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!team_id || !title || !description || !start || !end) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    if (title.trim() == "" || description.trim() == "") {
        callback({
            'code': "-3",
            'msg': "Both title and description cannot be empty"
        });
        return;
    }

    models.Team.findOne({_id: team_id}, function (err, team_obj) {

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
                    'msg': 'Permission denied'
                });
                return;
            }

            var newEvent = new models.Event({
                team_id: team_id,
                title: title,
                description: description,
                start: start,
                end: end,
                creator_id: user_id,
                creator_nickname: sess.nickname
            })

            newEvent.save();

            callback({
                'code': '1',
                'msg': 'Event ' + title + ' has been created successfully'
            });
            return;
        }

    });
};

exports.getEvents = function (sess, team_id, current_time, callback) {

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
            'msg': "team_id is missing"
        });
        return;
    }

    models.Team.findOne({_id: team_id}, function (err, team_obj) {

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
                    'msg': 'Permission denied'
                });
                return;
            }

            models.Event.find({team_id: team_id}, function (err, events) {

                if (events.length != 0) {

                    if (current_time == '') {
                        callback({
                            'code': '1',
                            'msg': 'Get events successfully',
                            'events': events,
                            'team_name': team_obj.name
                        });
                        return;
                    }

                    var result = [];
                    for (var j = 0; j < events.length; j++) {
                        var event = events[j];
                        var start = new Date(event.start).getTime();
                        var diff = start - current_time;
                        if (diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000) {
                            result.push(event)
                        }
                    }
                    callback({
                        'code': '1',
                        'msg': 'Get events successfully',
                        'events': result,
                        'team_name': team_obj.name
                    });
                    return;

                } else {

                    callback({
                        'code': '-3',
                        'msg': 'There is no event in this team'
                    });

                }


            });

        }

    });
};

exports.delete = function (sess, event_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session, login required"
        });
        return;
    }

    if (!event_id) {
        callback({
            'code': "-10",
            'msg': "event_id is missing"
        });
        return;
    }

    models.Event.findOne({_id: event_id}, function (err, event_obj) {

        if (!event_obj) {

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });
            return;

        } else {

            // check if user is the creator of this to event
            if (user_id != event_obj.creator_id) {

                callback({
                    'code': '-2',
                    'msg': 'Permission denied'
                });

            } else {

                event_obj.remove();

                callback({
                    'code': '1',
                    'msg': 'Event ' + event_obj.title + ' has been deleted successfully'
                });
            }
        }

    });
};

// exports.get_coming_events = function (sess, teams, current_time, callback) {
//
//     var user_id = sess.user_id;
//
//     if (!user_id) {
//         callback({
//             code: '-9',
//             msg: 'No session, login required'
//         });
//         return;
//     }
//
//     if (!teams || teams.length == 0) {
//         callback({
//             code: '-10',
//             msg: 'no teams'
//         });
//         return;
//     }
//
//     if (!current_time) {
//         callback({
//             code: '-8',
//             msg: 'no current time'
//         });
//         return;
//     }
//
//     models.Event.find({
//         team_id: {
//             $in: teams
//         }
//     }, function (err, events) {
//         if (err) {
//             throw err;
//         }
//         var result = [];
//         for (var j = 0; j < events.length; j++){
//             var event = events[j];
//             var start = new Date(event.start).getTime();
//             if(start >= current_time){
//                 result.push(event)
//             }
//         }
//         callback({
//             code: 1,
//             msg: 'get coming events ok'
//         })
//
//     })
//
//
// };