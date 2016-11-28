var app = angular.module('chat', []);

app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});


app.controller('ChatController', function Ctrl($scope, $socket, $rootScope, $http) {
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
    var self_icon = "/images/default_avatar.jpg";
    const GET_AVATAR_URL = "/users/download_avatar?user_id=";
    // initialize msg list
    $scope.msg_list = [];
    // check if user has avatar
    $http.get('/users/download_avatar')
        .then(
        function (res) {
            if(!res.data.code){
                self_icon = '/users/download_avatar';
            }
        }, function (error) {
            console.log('error in get team info ' + error);
        }
    );
    // generate a GUID
    var uuid = guid();


    $scope.getClass = function (index) {
        return role_arr[index].class;
    };

    $scope.getSrc = function (index) {
        return role_arr[index].src;
    };

    /* on receive team message */
    $socket.on('team_msg', function (json) {

        var team_ui = $rootScope.selectedTeamId;

        if (json.uuid != uuid && json.team_id == team_ui) { // if not my message & is in the same team
            // update ui
            var nickname = json.nickname;
            var msg = json.msg;
            var time = json.time;

            //noinspection JSAnnotator
            $scope.msg_list.push({index, nickname, msg, time});
            var url = GET_AVATAR_URL + json.user_id;
            role_arr.push({class: "other", src: url});
            index++;
            console.log('i got msg' + msg);
        }
    });

    /* on send team message */
    $scope.emitTeamMsg = function emitTeamMsg() {

        var nickname = $rootScope.user.nickname;
        var user_id = $rootScope.user.user_id;
        var team_ui = $rootScope.selectedTeamId;

        console.log(team_ui);

        // send json to server
        var msg = $scope.dataToSend;
        if (msg.trim() == "") {
            return;
        }

        // format time
        var d = new Date();
        var min = d.getMinutes();
        if (min < 10)
            min = '0' + min;
        var time = d.getHours() + ":" + min;

        var json = {};
        json.nickname = nickname;
        json.msg = msg;
        json.team_id = team_ui; // tmp: to be changed
        json.uuid = uuid;
        json.time = time;
        json.user_id = user_id;

        $socket.emit('team_msg', json);

        // update ui
        $scope.dataToSend = "";

        //noinspection JSAnnotator
        $scope.msg_list.push({ index, nickname, msg, time });
        role_arr.push({ class: "self", src: self_icon });
        index++;
    };

    // check when selected team changes
    $scope.$watch(function () { return $rootScope.selectedTeamId; }, function (newVal, oldVal) {

            // load chat history
            $http.get('/teams/chat_history?team_id=' + newVal)
                .then(
                function (res) {
                    var detail;
                    if (res.data.code == 1) {
                        var history = res.data.history;
                        var user_id = $rootScope.user.user_id;
                        $scope.msg_list = [];
                        role_arr = [];
                        for (var i = 0; i < history.length; i++) {
                            var nickname = history[i].nickname;
                            var msg = history[i].message;
                            var time = history[i].time;
                            //noinspection JSAnnotator
                            $scope.msg_list.push({ i, nickname, msg, time });
                            if(history[i].user_id == user_id){
                                role_arr.push({ class: "self", src: self_icon });
                            }else{
                                var url = GET_AVATAR_URL + history[i].user_id;
                                role_arr.push({ class: "other", src: url });
                            }
                        }
                    } else {
                        // clear arrays
                        $scope.msg_list = [];
                        role_arr = [];
                    }
                }, function (error) {
                    console.log('error in get team chat history ' + error);
                });
    })
});
// scroll list to bottom when type in or receive a new message
app.directive('scrollSection',
    ['$location', '$timeout', '$anchorScroll',
        function ($location, $timeout, $anchorScroll) {
            return {
                scope: {
                    scrollBottom: "="
                },
                link: function ($scope, $element) {
                    $scope.$watchCollection('scrollBottom', function (newValue) {
                        if (newValue) {
                            console.log($scope.scrollBottom.length);
                            var index = $scope.scrollBottom.length - 1;
                            var id = 'msg_' + index;
                            $location.hash(id);
                            $timeout(function () {
                                $anchorScroll();
                            });

                        }
                    });
                }
            }
        }]);