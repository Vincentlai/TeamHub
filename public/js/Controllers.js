/**
 * Created by Qiang Lai on 2016/10/30.
 */
;(function () {
    'use strict';
    var module = angular.module('Controllers', []);

    module.controller('login', [
            '$scope',
            'UserService',
            function ($scope, UserService) {
                $scope.User = UserService;
            }
        ]
    );
    module.controller('signup', [
            '$scope',
            'UserService',
            function ($scope, UserService) {
                $scope.User = UserService;
            }
        ]
    );
    module.directive('emailExists', [
        '$http',
        function ($http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var ngModel = ctrl;

                    scope.$watch(attrs.ngModel, function (n, o) {
                        if (n !== o) {
                            console.log(n);
                            console.log(o);
                            var url = '/users/is_exist?email=' + n;
                            $http.get(url)
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            ngModel.$setValidity('emailExists', false);
                                        } else {
                                            ngModel.$setValidity('emailExists', true);
                                        }
                                    }, function (error) {
                                        ngModel.$setValidity('emailExists', true);
                                    }
                                );
                        }
                    }, true);
                }
            }
        }
    ]);
    module.directive('emailNotexists', [
        '$http',
        function ($http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var ngModel = ctrl;

                    scope.$watch(attrs.ngModel, function (n, o) {
                        if (n !== o) {
                            console.log(n);
                            console.log(o);
                            var url = '/users/is_exist?email=' + n;
                            $http.get(url)
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            ngModel.$setValidity('emailNotexists', true);
                                        } else {
                                            ngModel.$setValidity('emailNotexists', false);
                                        }
                                    }, function (error) {
                                        ngModel.$setValidity('emailNotexists', false);
                                    }
                                );
                        }
                    }, true);
                }
            }
        }
    ]);
    module.controller('headerController', [
        '$scope',
        'Auth',
        '$state',
        '$http',
        '$rootScope',
        function ($scope, Auth, $state, $http, $rootScope) {
        }
    ]);
    module.controller('postController', [
            '$scope',
            'postList',
            '$state',
            '$http',
            '$timeout',
            '$rootScope',
            function ($scope, postList, $state, $http, $timeout, $rootScope) {
                /*
                 keys in post list item
                 comments   Array[0]
                 like
                 nickname
                 post_id
                 text
                 time
                 */
                $scope.postList = postList;
                $scope.createPost = function () {
                    $http.post('/posts/post', {
                        text: $scope.input.description,
                        team_id: $rootScope.selectedTeamId
                    })
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    $scope.closeForm('create-post');
                                    $timeout(
                                        function () {
                                            $state.transitionTo($state.current.name, null,
                                                {reload: $state.current.name, inherit: false, notify: true});
                                            delete $scope.input;
                                        }, 500);
                                } else {
                                    $scope.msg = res.data.msg;
                                    $scope.error = true;
                                    $timeout(function () {
                                        $scope.error = false;
                                        $scope.msg = null;
                                    }, 4000);
                                }
                            }, function (error) {
                                console.log('error in creating post ' + error);
                            }
                        )
                }

            }
        ]
    );
    module.controller('homeController', [
        '$scope',
        '$rootScope',
        '$state',
        'information',
        '$timeout',
        'Auth',
        '$http',
        function ($scope, $rootScope, $state, information, $timeout, Auth, $http) {
            $scope.teams = information.teams;
            $scope.hasNoTeam = ($scope.teams.length === 0);
            $rootScope.user = information.user;
            $rootScope.isLoggedin = $rootScope.user;
            $scope.openTag = function () {
                for(var i = 0; i < $scope.teams.length ; i++){
                    if($scope.teams[i].id == $rootScope.selectedTeamId){
                        // var element = angular.element(document.querySelector('#team' + i));
                        // $(element.children()[1]).slideToggle();
                        $scope.index = i;
                        $timeout(function () {
                            $scope.tagSlide('teams' + $scope.index);
                        },10);
                        break;
                    }
                }
            };

            $scope.$watch(function () {
                return $state.$current.name;
            }, function (newState, oldState) {
                $scope.isManage = (newState.includes('teams'));
                $scope.isOverview = (newState.includes('overview'));
                $scope.isPost = (newState.includes('post'));
                $scope.isEvent = (newState.includes('event'));
                $scope.isChat = (newState.includes('chat'));
                $scope.isFile = (newState.includes('file'));

            });
            /*
             Log out
             */
            $rootScope.logout = function () {

                $http.post('/users/logout')
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                Auth.removeCookie();
                                $scope.clear();
                                $state.go('login');
                                console.log('remove user');
                            }
                            Auth.removeCookie();
                            $state.go('login');
                            return res.data.code;
                        }, function (error) {
                            console.log('Error occurs in Logout' + error);
                        }
                    )
            };
            /*
             Open or close tag
             */
            $scope.tagSlide = function (tagName) {
                var element = angular.element(document.querySelector('#' + tagName));
                if( $(element).hasClass('open')){
                    $(element).removeClass('open');
                }else {
                    $(element).addClass('open');
                }
                $(element.children()[1]).slideToggle();
            };


            $scope.isSelected = function (id) {
                return id === $rootScope.selectedTeamId;
            };

            /*
             Show team form
             */
            $scope.createForm = function (tag, team_id, name, teammates) {
                $scope.selectedTeamId = team_id;
                $scope.selectedTeamName = name;
                $scope.selectedTeamTeammates = teammates;
                $('#' + tag).addClass('is-visible');
            };
            /*
             Close team form
             */
            $scope.closeForm = function (tag, flag) {
                if (flag) {
                    delete $scope.input;
                }
                delete $scope.selectedTeamId;
                delete $scope.selectedTeamName;
                delete $scope.selectedTeamTeammates;
                $('#' + tag).removeClass('is-visible');
            };

            $scope.createTeam = function () {
                console.log('createTeam clicked');
                $http.post('/teams/create', $scope.team)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('create-team');
                                $timeout(
                                    function () {
                                        $scope.$emit('ChangeTeam', $state.$current);
                                        delete $scope.team;
                                    }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    $scope.msg = null;
                                }, 4000);
                            }
                        }, function (error) {
                            console.log('error in create teams ' + error);
                        }
                    )
            };
            $scope.changeID = function(id){
              $rootScope.selectedTeamId = id;
            };
            $rootScope.clear = function () {
                delete $rootScope.selectedTeamId;
            };

            /*
             Reload side bar when add or delete team
             */
            $scope.$on('ChangeTeam',
                function (event, args) {
                    $state.transitionTo(args, null, {reload: true, inherit: false, notify: true});
                });
        }
    ]);

    module.controller('calendarController', [
        '$scope',
        '$timeout',
        function($scope, $timeout){
            //for event test, after passing the test, using database to access events.
            $scope.events = [
                {
                    start: getDate(-6, 0),
                    end: getDate(-4, 0),
                    title: 'Event 1'
                },
                {
                    start: getDate(0, 10),
                    end: getDate(1, 11),
                    title: 'Event 1'
                },
                {
                    start: getDate(1, 11),
                    end: getDate(2, 12),
                    title: 'Event 2'
                },
                {
                    start: getDate(2, 12),
                    end: getDate(3, 13),
                    title: 'Event 3'
                },
                {
                    start: getDate(4, 12),
                    end: getDate(5, 13),
                    title: 'Event 4'
                },
                {
                    start: getDate(5, 12),
                    end: getDate(6, 13),
                    title: 'Event 5'
                },
                {
                    start: getDate(6, 12),
                    end: getDate(6, 13),
                    title: 'Event 6'
                },
                {
                    start: getDate(6, 12),
                    allDay: true,
                    title: 'Event 7'
                }
            ];

            $scope.selected = $scope.events[0];
            $scope.showCreateEventForm = false;

            function getDate(offsetDays, hour) {
                offsetDays = offsetDays || 0;
                var offset = offsetDays * 24 * 60 * 60 * 1000;
                var date = new Date(new Date().getTime() + offset);
                if (hour) { date.setHours(hour); }
                return date;
            }
            //new///////////////////////////////////////////
            function setDate(time){
                time = time || 0;
            }

            function createEvent(date){
                var newEvent = {
                    start: getDate(6, 12),
                    end: getDate(6, 13),
                    allDay: false,
                    title: 'Event new'
                }
            }

            function currentDay(date){
                return date;
            }

            $scope.eventClicked = function (item) {
                console.log(item);
            };

            $scope.resetTime=function(){
                $scope.eventTimeHour = 0;
                $scope.eventTimeMin = 0;
                //console.log("aaa");
            };

            $scope.createClicked = function (date) {
                console.log(date);
                $scope.showCreateEventForm = true;
                $scope.result = currentDay(date);
                createEvent(date);
            };

            $scope.dis = false;



    }
    ]);

    module.controller('post', [
            '$scope',
            'PostService',
            function ($scope, PostService) {
                $scope.post = PostService;
            }
        ]
    );
    module.controller('sideBarController', [
        '$scope',
        '$timeout',
        '$state',
        function ($http, $scope, $timeout, $state) {
            $scope.team = {};
            $scope.loadTeamDetail = function () {
                $scope.teamsDetail = [];
                for (var i = 0; i < $scope.teams.length; i++) {
                    $http.get('/teams/team_info?team_id=' + $scope.teams[i].id)
                        .then(
                            function (res) {
                                var detail;
                                if (res.data.code == 1) {
                                    detail = {
                                        name: res.data.name,
                                        team_id: res.data.team_id,
                                        description: res.data.description,
                                        is_creator: res.data.r_u_creator,
                                        teammates: res.data.users
                                    };
                                    $scope.teamsDetail[$scope.teamsDetail.length] = detail;
                                } else {
                                    $scope.teamsDetail[$scope.teamsDetail.length] = {};
                                }
                            }, function (error) {
                                console.log('error in get team info ' + error);
                            }
                        );
                }
            };
            $scope.deleteTeam = function () {
                console.log('delete');
                $http.delete('/teams/delete?team_id=' + $scope.selectedTeamId)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('delete-team');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot delete team');
                            }
                        }, function (error) {
                            console.log('error in delete team ' + error);
                        }
                    )
            };
            $scope.addUser = function () {
                console.log('addUSER');
                $scope.input.team_id = $scope.selectedTeamId;
                $http.post('/teams/add_user', $scope.input)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('add-user');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot add user');
                            }
                        }, function (error) {
                            console.log('error in add user ' + error);
                        }
                    );
            };
            $scope.removeUser = function () {
                console.log('remove user');
                $scope.input.team_id = $scope.selectedTeamId;
                $http.delete('/teams/remove_user?team_id=' + $scope.input.team_id
                    + '&user_id=' + $scope.input.user_id + '&message=' + $scope.input.message)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('remove-user');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot remove user');
                            }
                        }, function (error) {
                            console.log('error in remove user ' + error);
                        }
                    );
            };
            $scope.quitTeam = function () {
                console.log('quit');
                $http.delete('/teams/quit?team_id=' + $scope.selectedTeamId)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('quit-team');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot quit team');
                            }
                        }, function (error) {
                            console.log('error in quit team ' + error);
                        }
                    )
            };

        }
    ]);
    // module.controller('teamDetailController', [
    //     '$scope',
    //     '$stateParams',
    //     '$http',
    //     '$state',
    //     '$timeout',
    //     function ($scope, $stateParams, $http, $state, $timeout) {
    //         $scope.team_id = $stateParams.team_id;
    //         $scope.team_name = $stateParams.team_name;
    //
    //     }
    // ]);
    module.controller('chatController', [
        '$scope',
        '$rootScope',
        function ($scope, $rootScope) {

        }
    ]);
}());