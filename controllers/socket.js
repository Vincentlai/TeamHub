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

            if (json.file_id) {
                var newMsg = new models.ChatHistory({
                    team_id: json.team_id,
                    nickname: json.nickname,
                    user_id: json.user_id,
                    time: json.time,
                    message: json.msg,
                    file_id: json.file_id
                });
            } else {
                var newMsg = new models.ChatHistory({
                    team_id: json.team_id,
                    nickname: json.nickname,
                    user_id: json.user_id,
                    time: json.time,
                    message: json.msg
                });

            }

            newMsg.save(function (err, msg) {
                if (err) {
                    console.log("Error saving team chat message");
                }
            });

            io.emit('team_msg', json);

        });
    });
};