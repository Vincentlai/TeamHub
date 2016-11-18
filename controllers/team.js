var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.create = function(sess, name, description, callback) {

    var user_id = sess.user_id;
    var nickname = sess.nickname;

    if (!user_id) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    name = name.trim();
    if (!name) {

        callback({
            'code': '-10',
            'msg': 'Name cannot be empty'
        });
        return;
    }

    var des = "";
    if (description) {
        des = description;
    }

    models.Team.find({ name: name }, function(err, team_obj) {

        if (team_obj.length == 0) {

            var newTeam = new models.Team({
                name: name,
                description: des,
                creator_id: user_id,
                users: [{
                    id: user_id,
                    nickname: nickname
                }]
            });

            newTeam.save(function(err, newTeam) {

                if (!err) {
                    // update teams array in user doc
                    models.User.findOne({ _id: user_id }, function(err, user_obj) {

                        user_obj.teams.push({
                            id: newTeam.id,
                            name: name,
                            is_creator: true
                        });
                        user_obj.save();

                    });

                    callback({
                        'code': '1',
                        'msg': 'Team ' + newTeam.name + ' has been created successfully'
                    });
                    return;
                } else {
                    callback({
                        'code': '-2',
                        'msg': 'error occurs'
                    });
                    return;
                }
            });

        } else {

            callback({
                'code': '-1',
                'msg': 'Team name is already taken, please use another team name'
            });
            return;
        }
    });
}

exports.delete = function(sess, team_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    if (!team_id) {

        callback({
            'code': '-10',
            'msg': 'team_id is missing'
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


            var creator_id = team_obj.creator_id;
            var teamMemAry = team_obj.users;
            var teamName = team_obj.name;

            // if non-creator try to delete the team
            if (creator_id != user_id) {

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return;

            } else if (teamMemAry.length != 1) {

                callback({
                    'code': '-3',
                    'msg': 'You cannot delete the team that has users other than the creator'
                });
                return;

            } else {

                // delete the team from DB
                team_obj.remove();

                // delete the team from user doc
                models.User.findOne({ _id: user_id }, function(err, user_obj) {

                    for (var i = 0; i < user_obj.teams.length; i++) {
                        if (user_obj.teams[i].id == team_id) {
                            user_obj.teams[i].remove();
                            user_obj.save();
                            break;
                        }
                    }

                });

                callback({
                    'code': '1',
                    'msg': teamName + ' has been deleted successfully'
                });
                return;
            }
        }
    });
}

exports.addUser = function(sess, team_id, user_id, email, nickname, message, callback) {

    var cid = sess.user_id;

    if (!cid) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    if (!team_id || (!user_id && !email && !nickname)) {

        callback({
            'code': '-10',
            'msg': 'Missing fields'
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

            var creator_id = team_obj.creator_id;

            // if non-creator try to invite new member
            if (creator_id != cid) {

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return;

            } else {

                // check whether the user is valid
                models.User.findOne({ $or: [{ _id: user_id }, { email: email }, { nickname: nickname }] }, function(err, user_obj) {

                    if (!user_obj) {

                        callback({
                            'code': '-3',
                            'msg': 'Invalid user identifier'
                        });
                        return;

                    } else {

                        var user_id = user_obj._id;

                        // check whether user is already added to team
                        var found = false;
                        for (var i = 0; i < team_obj.users.length; i++) {
                            if (team_obj.users[i].id == user_id) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {

                            // add user to user array in team doc
                            team_obj.users.push({
                                id: user_id,
                                nickname: user_obj.nickname
                            });
                            // add team to team array in user doc
                            user_obj.teams.push({
                                id: team_id,
                                name: team_obj.name,
                                is_creator: false

                            });
                            // increment new notication
                            user_obj.num_of_new_notif = user_obj.num_of_new_notif + 1;
                            // push new notifaction 
                            var nickname = sess.nickname;

                            var msg = "None"
                            if (message) {
                                msg = message;
                            }
                            user_obj.notifications.push("You are added to " + team_obj.name + " by " + nickname
                                + ". Message: " + msg);
                            //save
                            team_obj.save();
                            user_obj.save();

                            callback({
                                'code': '1',
                                'msg': user_obj.nickname + " is added to team " + team_obj.name
                            });
                            return;

                        } else {
                            callback({
                                'code': '-4',
                                'msg': 'Cannot add same user to team twice'
                            });
                            return;
                        }
                    }
                });
            }
        }
    });
}

exports.removeUser = function(sess, team_id, user_id, email, nickname, message, callback) {

    var cid = sess.user_id;

    if (!cid) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    if (!team_id || (!user_id && !email && !nickname)) {

        callback({
            'code': '-10',
            'msg': 'Missing fields'
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

            var creator_id = team_obj.creator_id;

            // if non-creator try to invite new member
            if (creator_id != cid) {

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return;

            } else {

                // check if user_id is the creator_id
                if (user_id == team_obj.creator_id || email == sess.email || nickname == sess.nickname) {
                    callback({
                        'code': '-5',
                        'msg': 'You cannot remove the creator'
                    });
                    return;
                }

                // check whether the user is valid
                models.User.findOne({ $or: [{ _id: user_id }, { email: email }, { nickname: nickname }] }, function(err, user_obj) {

                    if (!user_obj) {

                        callback({
                            'code': '-3',
                            'msg': 'Invalid user identifier'
                        });
                        return;

                    } else {

                        user_id = user_obj._id;

                        // check whether user is already added to team
                        var found = false;
                        var toBeRemoved;
                        for (var i = 0; i < team_obj.users.length; i++) {
                            if (team_obj.users[i].id == user_id) {
                                found = true;
                                team_obj.users[i].remove();
                                break;
                            }
                        }

                        if (found) {

                            // remove the team in user
                            for (var i = 0; i < user_obj.teams.length; i++) {
                                if (user_obj.teams[i].id == team_id) {
                                    user_obj.teams[i].remove();
                                    break;
                                }
                            }

                            // notifaction
                            user_obj.num_of_new_notif = user_obj.num_of_new_notif + 1;
                            // push new notifaction 
                            var nickname = sess.nickname;

                            var msg = "None"
                            if (message) {
                                msg = message;
                            }
                            user_obj.notifications.push("You are removed from " + team_obj.name + " by " + nickname
                                + ". Message: " + msg);
                            //save
                            team_obj.save();
                            user_obj.save();

                            callback({
                                'code': '1',
                                'msg': user_obj.nickname + " is removed from team " + team_obj.name
                            });
                            return;

                        } else {
                            callback({
                                'code': '-4',
                                'msg': 'This user is not in the team'
                            });
                            return;
                        }
                    }
                });
            }
        }
    });
}

exports.quit = function(sess, team_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    if (!team_id) {

        callback({
            'code': '-10',
            'msg': 'team_id is missing'
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

            var creator_id = team_obj.creator_id;

            // if non-creator try to invite new member
            if (creator_id == user_id) {

                callback({
                    'code': '-3',
                    'msg': 'Cannot quit this team because you are the creator'
                });
                return;

            } else {

                // check whether the user is valid
                models.User.findOne({ _id: user_id }, function(err, user_obj) {

                    // check whether user is in the team
                    var found = false;
                    var toBeRemoved;
                    for (var i = 0; i < team_obj.users.length; i++) {
                        if (team_obj.users[i].id == user_id) {
                            found = true;
                            team_obj.users[i].remove();
                            break;
                        }
                    }

                    if (found) {

                        // remove the team in user
                        for (var i = 0; i < user_obj.teams.length; i++) {
                            if (user_obj.teams[i].id == team_id) {
                                user_obj.teams[i].remove();
                                break;
                            }
                        }

                        //save
                        team_obj.save();
                        user_obj.save();

                        callback({
                            'code': '1',
                            'msg': user_obj.nickname + " quited from team " + team_obj.name
                        });
                        return;

                    } else {
                        callback({
                            'code': '-2',
                            'msg': 'You are not in this team'
                        });
                        return;
                    }
                });
            }
        }
    });
}

exports.teamInfo = function(sess, team_id, callback) {

    var user_id = sess.user_id;

    if (!user_id) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    if (!team_id) {

        callback({
            'code': '-10',
            'msg': 'Missing team_id'
        });
        return;
    }

    models.Team.findOne({ _id: team_id }, function(err, team_obj) {

        if (!team_obj) {

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });

        } else {

            models.User.findOne({ _id: user_id }, function(err, user_obj) {

                // check whether user is in the team
                var found = false;
                for (var i = 0; i < team_obj.users.length; i++) {
                    if (team_obj.users[i].id == user_id) {
                        found = true;
                        break;
                    }
                }

                var r_u_creator = false;
                if(user_id == team_obj.creator_id){
                    r_u_creator = true;
                }

                if (found) {

                    callback({
                        'code': '1',
                        'msg': 'Get team info successfully',
                        'name': team_obj.name,
                        'team_id': team_id,
                        'description': team_obj.description,
                        'r_u_creator': r_u_creator,
                        'users': team_obj.users
                    });

                } else {

                    callback({
                        'code': '-2',
                        'msg': 'Permission denied, you are not in this team'
                    });
                }
            });
        }
    });
};