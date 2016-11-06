var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.create = function(sess, name, description, callback) {

    var user_id = sess.user_id;

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

    models.Team.find({name: name},function(err,team_obj){

        if(team_obj.length == 0){

            var newTeam = new models.Team({
                name : name,
                description : des,
                creator_id : user_id,
                users: [user_id]
            });

            newTeam.save(function (err, obj) {

                if(!err){
                    callback({
                        'code': '1',
                        'msg': 'Team '+obj.name+' has been created successfully'
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

exports.delete = function(sess, name, description, callback) {

    

}