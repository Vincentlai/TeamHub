var app = angular.module('chat', []);

app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});


app.controller('Ctrl', function Ctrl($scope, $socket) {

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    var index = 0;
    var role_arr = [];
    var self_icon = "http://i.imgur.com/HYcn9xO.png";
    var other_icon = "http://i.imgur.com/DY6gND0.png";
    // generate a GUID
    var uuid = guid();
    // initialize msg list
    $scope.msg_list = [];

    $scope.getClass = function(index){
        return role_arr[index].class;
    };

    $scope.getSrc = function(index){
        return role_arr[index].src;
    };

    /* on receive team message */
    $socket.on('team_msg', function (json) {

        if (json.uuid != uuid) { // if not my message
            // update ui
            var msg = json.msg;
            var time = new Date().getHours() + ":" + new Date().getMinutes();
            //$scope.role_class = getClass;
            //$scope.icon_scr = getSrc;
            $scope.msg_list.push({ index, msg, time });
            role_arr.push({class:"other", src:other_icon});
            index++;
        }
    });

    /* on send team message */
    $scope.emitTeamMsg = function emitTeamMsg() {

        // send json to server
        var json = {};
        var msg = $scope.dataToSend;
        json.msg = msg;
        json.team_id = "1234567890"; // tmp: to be changed
        json.uuid = uuid;

        $socket.emit('team_msg', json);

        // update ui
        $scope.dataToSend = '';
        var time = new Date().getHours() + ":" + new Date().getMinutes();
        //$scope.role_class = getClass;
        //$scope.icon_scr = getSrc;
        $scope.msg_list.push({ index, msg, time });
        role_arr.push({class:"self", src:self_icon});
        index++;
    };

    $scope.emitACK = function emitACK() {
        $socket.emit('echo-ack', $scope.dataToSend, function (data) {
            //se nao tivesse sido feito $apply
            //a variavel $scope não seria reconhecida
            $scope.serverResponseACK = data;
        });
        $scope.dataToSend = '';
    };
});