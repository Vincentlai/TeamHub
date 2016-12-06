var app = angular.module('chat', []);

// UNNECESSARY:
// app.config(function ($socketProvider) {
//     $socketProvider.setConnectionUrl('http://localhost:8080'); // when using local machine
//     //$socketProvider.setConnectionUrl('http://localhost:3000'); // when using vagrant
//     //$socketProvider.setConnectionUrl('http://ec2-52-40-59-253.us-west-2.compute.amazonaws.com:8080'); // when using aws
// });

app.controller('ChatController', function Ctrl($scope, $socket, $rootScope, $http, $window, Upload, $timeout) {

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    $rootScope.inChatRoomTeamId = $rootScope.selectedTeamId;

    var index = 0;
    var role_arr = [];
    var self_icon = "/images/default_avatar.jpg";
    const GET_AVATAR_URL = "/users/download_avatar?user_id=";
    // initialize msg list
    $scope.msg_list = [];

    // hide zoom in image
    $scope.showZoomIn = false;

    // loading ani
    $scope.isUploading = false;

    // check if user has avatar
    $http.get('/users/download_avatar')
        .then(
            function (res) {
                if (!res.data.code) {
                    self_icon = '/users/download_avatar';
                }
            }, function (error) {
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

    $scope.hasImg = function (index) {
        return $scope.msg_list[index].file_id;
    };

    $scope.zoomIn = function (file_id) {
        $scope.zoom_in_file_id = file_id;
        $scope.showZoomIn = true;
    };

    $scope.ZoomOut = function () {
        $scope.showZoomIn = false;
    };

    /* on receive team message */
    $socket.on('team_msg', function (json) {

        var team_ui = $rootScope.selectedTeamId;

        if (json.uuid != uuid && json.team_id == team_ui) { // if not my message & is in the same team
            // update ui
            var nickname = json.nickname;
            var msg = json.msg;
            var time = json.time;
            var file_id = json.file_id;

            //noinspection JSAnnotator
            $scope.msg_list.push({index, nickname, msg, time, file_id});
            var url = GET_AVATAR_URL + json.user_id;
            role_arr.push({class: "other", src: url});
            index++;
        }
    });

    /* on send team message */
    $scope.emitTeamMsg = function emitTeamMsg() {
        if (angular.isUndefined($scope.dataToSend)) {
            return;
        }

        var nickname = $rootScope.user.nickname;
        var user_id = $rootScope.user.user_id;
        var team_ui = $rootScope.selectedTeamId;

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
        $scope.msg_list.push({index, nickname, msg, time});
        role_arr.push({class: "self", src: self_icon});
        index++;
    };

    /* on send picture */
    $scope.pickFile = function () {
        setTimeout(function () {
            document.getElementById('pick_file').click()
        }, 0);
    };

    var handleFileSelect = function (evt) {

        var file = evt.currentTarget.files[0];
        file_name = file.name;
        file_size = file.size;

        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                dataUrl = evt.target.result;

                // file size limit check
                if (file_size > 16000000) {
                    $window.alert("Your picture is over 16 MB");
                    return;
                }

                $scope.isUploading = true;

                Upload.upload({
                    url: '/files/upload',
                    data: {
                        team_id: $rootScope.selectedTeamId,
                        file: Upload.dataUrltoBlob(dataUrl),
                        file_name: file_name,
                        file_size: file_size,
                        is_pic: true
                    }
                }).then(function (response) {
                    $timeout(function () {

                        $scope.isUploading = false;

                        var data = response.data;

                        if (data.code == '1') {

                            var nickname = $rootScope.user.nickname;
                            var user_id = $rootScope.user.user_id;
                            var team_ui = $rootScope.selectedTeamId;
                            var file_id = data.file_id;
                            var msg = '';

                            // send json to server

                            // format time
                            var d = new Date();
                            var min = d.getMinutes();
                            if (min < 10)
                                min = '0' + min;
                            var time = d.getHours() + ":" + min;

                            var json = {};
                            json.file_id = file_id;
                            json.nickname = nickname;
                            json.team_id = team_ui; // tmp: to be changed
                            json.uuid = uuid;
                            json.time = time;
                            json.user_id = user_id;

                            $socket.emit('team_msg', json);

                            //noinspection JSAnnotator
                            $scope.msg_list.push({index, nickname, msg, time, file_id});
                            role_arr.push({class: "self", src: self_icon});
                            index++;


                        } else {
                        }
                    });
                }, function (response) {
                    if (response.status > 0) {
                    }
                    $scope.isUploading = false;
                }, function (evt) {
                });
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#pick_file')).on('change', handleFileSelect);

    // check when selected team changes
    $scope.$watch(function () {
        return $rootScope.selectedTeamId;
    }, function (newVal, oldVal) {
        $rootScope.is_loading = true;
        // load chat history
        $http.get('/teams/chat_history?team_id=' + newVal)
            .then(
                function (res) {
                    var detail;
                    $rootScope.is_loading = false;
                    if (res.data.code == 1) {
                        var history = res.data.history;
                        var user_id = $rootScope.user.user_id;
                        $scope.msg_list = [];
                        role_arr = [];
                        for (var i = 0; i < history.length; i++) {
                            var nickname = history[i].nickname;
                            var msg = history[i].message;
                            var time = history[i].time;
                            var file_id = history[i].file_id;

                            //noinspection JSAnnotator
                            $scope.msg_list.push({i, nickname, msg, time, file_id});

                            if (history[i].user_id == user_id) {
                                role_arr.push({class: "self", src: self_icon});
                            } else {
                                var url = GET_AVATAR_URL + history[i].user_id;
                                role_arr.push({class: "other", src: url});
                            }
                        }
                    } else {
                        // clear arrays
                        $scope.msg_list = [];
                        role_arr = [];
                    }
                }, function (error) {
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