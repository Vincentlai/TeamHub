var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.create = function(sess, name, description, callback) {

    var user_id = sess.user_id;
    var nickname = sess.nickname;

    if(!user_id){

        callback({
            'code': '-9',
            'msg': 'No session, please log in first'
        });
        return;
    }

    name = name.trim();
    if(!name){

        callback({
            'code': '-10',
            'msg': 'Name cannot be empty'
        });
        return;
    }

    var des = "";
    if(description){
        des = description;
    }

    models.Team.find({name: name},function(err, team_obj){

        if(team_obj.length == 0){

            var newTeam = new models.Team({
                name: name,
                description: des,
                creator_id: user_id,
                users: [{ id: user_id,
                         nickname: nickname }]
            });

            newTeam.save(function (err, newTeam) {

                if(!err){
                    // update teams array in user doc
                    models.User.findOne({_id: user_id}, function(err, user_obj){

                        user_obj.teams.push({
                            id: newTeam.id,
                            name: name
                        });
                        user_obj.save();

                    });

                    callback({
                        'code': '1',
                        'msg': 'Team '+team_obj.name+' has been created successfully'
                    });
                    return;
                }else{
                    callback({
                        'code': '-2',
                        'msg': 'error occurs'
                    });
                    return;
                }
            });

        }else{

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

    if(!user_id){

        callback({
            'code': '-9',
            'msg': 'No session, please log in first'
        });
        return;   
    }

    if(!team_id){

        callback({
            'code': '-10',
            'msg': 'team_id is missing'
        });
        return; 

    }

    models.Team.findOne({_id: team_id}, function(err, team_obj){

        if(!team_obj){

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });
            return; 
        

        }else{


            var creator_id = team_obj.creator_id;
            var teamMemAry = team_obj.users;
            var teamName = team_obj.name;

            // if non-creator try to delete the team
            if(creator_id != user_id){

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return; 
            
            }else if(teamMemAry.length != 1){

                callback({
                    'code': '-3',
                    'msg': 'The team that you are trying to delete is not empty'
                });
                return; 

            }else{

                // delete the team from DB
                team_obj.remove();

                callback({
                    'code': '1',
                    'msg': teamName + ' has been deleted successfully'
                });
                return; 

            }

        }
    });
}

exports.addUser = function(sess, team_id, user_id, message, callback) {

     var cid = sess.user_id;

    if(!cid){

        callback({
            'code': '-9',
            'msg': 'No session, please log in first'
        });
        return;   
    }

    if(!team_id || !user_id){

        callback({
            'code': '-10',
            'msg': 'Missing fields'
        });
        return; 
    } 


    models.Team.findOne({_id: team_id}, function(err, team_obj){

        if(!team_obj){

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });
            return; 
        

        }else{

            var creator_id = team_obj.creator_id;

            // if non-creator try to invite new member
            if(creator_id != cid){

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return; 

            }else{

                // check whether the user is valid
                models.User.findOne({_id: user_id}, function(err, user_obj){

                    if(!user_obj){

                        callback({
                            'code': '-3',
                            'msg': 'Invalid user_id'
                        });
                        return; 

                    }else{

                        // check whether user is already added to team
                        var found = false;
                        for(var i = 0; i < team_obj.users.length; i++) {
                            if (team_obj.users[i].id == user_id) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {

                            // add user to user array in team doc
                            team_obj.users.push({id: user_id, nickname: user_obj.nickname});
                            // add team to team array in user doc
                            user_obj.teams.push({id: team_id, name: team_obj.name});
                            // increment new notication
                            user_obj.num_of_new_notif = user_obj.num_of_new_notif + 1;
                            // push new notifaction 
                            var nickname = sess.nickname;
                            
                            var msg = "None"
                            if(message){
                                msg = message;
                            }
                            user_obj.notifications.push("You are added to " + team_obj.name + " by " +nickname
                            +". Message: " + msg);
                            //save
                            team_obj.save();
                            user_obj.save();

                            callback({
                                'code': '1',
                                'msg': user_obj.nickname + " is added to team " + team_obj.name
                            });
                            return; 

                        }else{
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

exports.removeUser = function(sess, team_id, user_id, message, callback) {

     var cid = sess.user_id;

    if(!cid){

        callback({
            'code': '-9',
            'msg': 'No session, please log in first'
        });
        return;   
    }

    if(!team_id || !user_id){

        callback({
            'code': '-10',
            'msg': 'Missing fields'
        });
        return; 
    } 


    models.Team.findOne({_id: team_id}, function(err, team_obj){

        if(!team_obj){

            callback({
                'code': '-1',
                'msg': 'Invalid team_id'
            });
            return; 
        

        }else{

            var creator_id = team_obj.creator_id;

            // if non-creator try to invite new member
            if(creator_id != cid){

                callback({
                    'code': '-2',
                    'msg': 'You are not the creator of this team'
                });
                return; 

            }else{

                // check if user_id is the creator_id
                if(user_id == team_obj.creator_id){
                    callback({
                        'code': '-5',
                        'msg': 'You cannot remove the creator'
                    });
                    return;                     
                }

                // check whether the user is valid
                models.User.findOne({_id: user_id}, function(err, user_obj){

                    if(!user_obj){

                        callback({
                            'code': '-3',
                            'msg': 'Invalid user_id'
                        });
                        return; 

                    }else{

                        // check whether user is already added to team
                        var found = false;
                        var toBeRemoved;
                        for(var i = 0; i < team_obj.users.length; i++) {
                            if (team_obj.users[i].id == user_id) {
                                found = true;
                                team_obj.users[i].remove();           
                                break;
                            }
                        }

                        if (found) {

                            // remove the user in team
                            //toBeRemoved.remove();

                            // remove the team in user
                            for(var i = 0; i < user_obj.teams.length; i++) {
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
                            if(message){
                                msg = message;
                            }
                            user_obj.notifications.push("You are removed from " + team_obj.name + " by " +nickname
                            +". Message: " + msg);
                            //save
                            team_obj.save();
                            user_obj.save();

                            callback({
                                'code': '1',
                                'msg': user_obj.nickname + " is removed from team " + team_obj.name
                            });
                            return; 

                        }else{
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