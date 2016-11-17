var app = angular.module('chat', []);

app.config(function($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});


app.controller('Ctrl', function Ctrl($scope, $socket, $rootScope, $localStorage) {

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

    $scope.getClass = function(index) {
        return role_arr[index].class;
    };

    $scope.getSrc = function(index) {
        return role_arr[index].src;
    };

    /* on receive team message */
    $socket.on('team_msg', function(json) {

        var team_ui = $localStorage.selectedTeam.id;

        if (json.uuid != uuid && json.team_id == team_ui) { // if not my message & is in the same team
            // update ui
            var nickname = json.nickname;
            var msg = json.msg;
            var time = new Date().getHours() + ":" + new Date().getMinutes();

            $scope.msg_list.push({ index, nickname, msg, time });
            role_arr.push({ class: "other", src: other_icon });
            index++;
        }
    });

    /* on send team message */
    $scope.emitTeamMsg = function emitTeamMsg() {

        var nickname = $rootScope.user.nickname;
        var team_ui = $localStorage.selectedTeam.id;

        console.log(team_ui);

        // send json to server
        var msg = $scope.dataToSend;
        if (msg.trim() == "") {
            return;
        }
        var json = {};
        json.nickname = nickname;
        json.msg = msg;
        json.team_id = team_ui; // tmp: to be changed
        json.uuid = uuid;

        $socket.emit('team_msg', json);

        // update ui
        $scope.dataToSend = "";
        var time = new Date().getHours() + ":" + new Date().getMinutes();
        //$scope.role_class = getClass;
        //$scope.icon_scr = getSrc;
        $scope.msg_list.push({ index, nickname, msg, time });
        role_arr.push({ class: "other", src: self_icon });
        index++;
    };

    $scope.emitACK = function emitACK() {
        $socket.emit('echo-ack', $scope.dataToSend, function(data) {
            $scope.serverResponseACK = data;
        });
        $scope.dataToSend = '';
    };

    // check when selected team changes
    $scope.$watch(function() { return $localStorage.selectedTeam.id; }, function(newVal, oldVal) {

        if(newVal && oldVal){
            if(newVal != oldVal){

                // clear arrays
                $scope.msg_list = [];
                role_arr = [];
            }
        }
    })
});

// scroll list to bottom when type in or receive a new message
app.directive('scrollSection',
    ['$location', '$timeout', '$anchorScroll',
        function($location, $timeout, $anchorScroll) {
            return {
                scope: {
                    scrollBottom: "="
                },
                link: function($scope, $element) {
                    $scope.$watchCollection('scrollBottom', function(newValue) {
                        if (newValue) {
                            console.log($scope.scrollBottom.length);
                            var index = $scope.scrollBottom.length - 1;
                            var id = 'msg_' + index;
                            $location.hash(id);
                            $timeout(function() {
                                $anchorScroll();
                            });

                        }
                    });
                }
            }
        }]);