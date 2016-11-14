var models = require('../models/models.js');

onlineUsersList = [];
module.exports = function (io) {

    io.on('connection', function (socket) {
        /* on connect */
        console.log('-> a user connected through socket');
        console.log('** socket_id: ' + socket.id);
        console.log('** session_id: ' + socket.handshake.session.id);
        console.log('** user_id: ' + socket.handshake.session.user_id);

        // add new connected user to the onlineUser list
        onlineUsersList.push({
            user_id: socket.handshake.session.user_id,
            socket_id: socket.id
        })
        console.log('** current online users: ' + onlineUsersList.length + "\n")

        /* on disconnect */
        socket.on('disconnect', function () {
            console.log('-> user disconnected from socket');
            console.log('** socket_id: ' + this.id);

            // remove disconnected user from the onlineUser list
            for (var i = 0; i < onlineUsersList.length; i++) {
                if (onlineUsersList[i].socket_id == socket.id) {
                    onlineUsersList.splice(i, 1);
                }
            }
            console.log('** current online users: ' + onlineUsersList.length + "\n")
        });

        /* on chat room mesasge */
        socket.on('chat message', function (msg) {
            console.log("-> public chat message received");
            console.log("** socket_id: " + this.id);
            console.log("** session_id: " + socket.handshake.session.id);
            console.log("** user_id: " + socket.handshake.session.user_id);

            io.emit('chat message', msg);
        });

        socket.on('team_msg', function (json) {
            
            console.log("echo " + json.msg + " " +json.team_id + " " + json.uuid);

            io.emit('team_msg', json);
        });





        /* on private message */
        /*
        socket.on('private message', function(obj) {

            if(socket.handshake.session.user_id) {

                if (obj.receiver_user_id && obj.message) {

                    models.User.find({_id: obj.receiver_user_id}, function (err, users) {

                        if (users.length != 0) {

                            console.log("\n-> private message received by server");
                            console.log("** socket_id: " + this.id);
                            console.log("** session_id: " + socket.handshake.session.id);
                            console.log("** user_id: " + socket.handshake.session.user_id);

                            var sender_user_id = socket.handshake.session.user_id;
                            var receiver_user_id = obj.receiver_user_id;
                            var receiver_socket_id;

                            for (var i = 0; i < onlineUsersList.length; i++) {
                                if (onlineUsersList[i].user_id == receiver_user_id) {
                                    receiver_socket_id = onlineUsersList[i].socket_id;
                                }
                            }

                            if (receiver_socket_id === undefined) {
                                // save the message to unread database
                                console.log("** receiver is offline");
                            } else {
                                socket.broadcast.to(receiver_socket_id).emit('private message',
                                    {sender_user_id: sender_user_id,
                                            message: obj.message});
                                console.log("** private message is delivered to other user");
                            }

                            // save message to database
                            var newRecord = new models.ChatHistory
                            ({
                                sender_user_id: sender_user_id,
                                receiver_user_id: receiver_user_id,
                                message: obj.message
                            });
                            newRecord.save(function (err) {
                                if(err){
                                    console.log("** error: private message is not saved");
                                }else {
                                    console.log("** private message is saved");

                                    if(obj.message_id) {
                                        // sent back a confirmation with given message_id
                                        socket.emit('delivery confirmation', obj.message_id);
                                        console.log("** delivery confirmation has been sent back");
                                    }
                                }
                            });

                            // update last_msg and last_msg_date_time in ChatContact collection
                            models.ChatContact.find({$or : [
                                { $and : [ { my_user_id : sender_user_id }, { other_user_id : receiver_user_id } ] },
                                { $and : [ { my_user_id : receiver_user_id }, { other_user_id : sender_user_id } ] }
                            ]}, function (err, contacts) {
                                if(contacts){
                                    if(contacts.length != 0){
                                        for(var i=0; i<contacts.length; i++){
                                            contacts[i].last_msg = obj.message;
                                            contacts[i].last_msg_date_time = new Date().getTime();

                                            // update unread_msg only for the receiver in ChatContact collection
                                            if(contacts[i].my_user_id == receiver_user_id && contacts[i].other_user_id == sender_user_id){
                                                var n = contacts[i].number_of_unread_msg;
                                                contacts[i].number_of_unread_msg = n + 1;
                                                console.log("** number of unread message is updated for receiver");
                                            }
                                            contacts[i].save();
                                        }
                                        console.log("** ChatContact collections are updated for both users");
                                    }
                                }
                            });

                        } else {
                            console.log("-> invalid receiver_user_id");
                            socket.emit('server error', {
                                code: "-3",
                                msg: "Invalid receiver_user_id"
                            });
                        }
                    });
                } else {
                    console.log("-> required field not set");
                    socket.emit('server error', {
                        code: "-2",
                        msg: "Required field not set"
                    });
                }
            }else{
                console.log("-> fail to authenticate");
                socket.emit('server error', {
                    code: "-1",
                    msg: "Failed to authenticate"
                });
            }
        });

        /* on user is typing */
        /*
        socket.on('is typing', function(obj) {
            var sender_user_id = socket.handshake.session.user_id;
            if(sender_user_id) {
                var id = obj.toString();
                if(id){
                    var receiver_socket_id;
                    for (var i = 0; i < onlineUsersList.length; i++) {
                        if (onlineUsersList[i].user_id == id) {
                            receiver_socket_id = onlineUsersList[i].socket_id;
                        }
                    }
                    if (receiver_socket_id) {
                        socket.broadcast.to(receiver_socket_id).emit('is typing', sender_user_id);
                    }
                }
            }
        });

        /* on user is stop typing */
        /*
        socket.on('stop typing', function(obj) {
            var sender_user_id = socket.handshake.session.user_id;
            if(sender_user_id) {
                var id = obj.toString();
                if(id){
                    var receiver_socket_id;
                    for (var i = 0; i < onlineUsersList.length; i++) {
                        if (onlineUsersList[i].user_id == id) {
                            receiver_socket_id = onlineUsersList[i].socket_id;
                        }
                    }
                    if (receiver_socket_id) {
                        socket.broadcast.to(receiver_socket_id).emit('stop typing', sender_user_id);
                    }
                }
            }
        });
        */
    });
};