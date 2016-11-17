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
    // module.controller('headerCtrl', [
    //     '$scope',
    //     'Auth',
    //     '$state',
    //     '$http',
    //     '$rootScope',
    //     function ($scope, Auth, $state, $http, $rootScope) {
    //
    //     }
    // ]);
    module.controller('postController', [
            '$scope',
            'postList',
            '$localStorage',
            '$state',
            '$http',
            '$timeout',
            function ($scope, postList, $localStorage, $state, $http, $timeout, $stateParams) {
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
                console.log($stateParams);
                console.log($scope.current_team);
                $scope.createPost = function () {
                    $http.post('/posts/post',{
                        text: $scope.input.description,
                        team_id: $localStorage.selectedTeam.id})
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
        '$localStorage',
        function ($scope, $rootScope, $state, information, $timeout, Auth, $http, $localStorage) {


            // $scope.$watch(function () {
            //     return $state.$current.name;
            // }, function (newState, oldState) {
            //     var element = newState.replace('home.', '');
            //     var openElement = angular.element(document.querySelector('#' + element));
            //     $(openElement).addClass('open');
            //     if (newState !== oldState) {
            //         element = oldState.replace('home.', '');
            //         var closeElement = angular.element(document.querySelector('#' + element));
            //         $(closeElement).removeClass('open');
            //         $(closeElement.children()[1]).slideToggle();
            //     } else {
            //         $(openElement.children()[1]).slideToggle();
            //     }
            // }, true);
            $scope.teams = information.teams;
            $scope.hasNoTeam = ($scope.teams.length === 0);
            $rootScope.user = information.user;
            $scope.isLoggedin = $rootScope.user;
            /*
             Log out
             */
            $scope.logout = function () {
                $http.post('/users/logout')
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                Auth.removeCookie();
                                $state.go('login');
                                console.log('remove user');
                            }
                            Auth.removeCookie();
                            $state.go('login');
                        }, function (error) {
                            console.log('Error occurs in Logout' + error);
                        }
                    )
            };
            /*
             * Open teams tag when page load
             * */
            $scope.openTeam = function () {
                var openElement = angular.element(document.querySelector('#' + 'teams'));
                $(openElement).addClass('open');
                $timeout(function () {
                    $(openElement.children()[1]).slideToggle();
                }, 300);
                $timeout(function () {
                    if($localStorage.selectedTeam){
                        $('#second-list').addClass('is-visible');
                    }
                }, 800);
            };
            /*
             Open or close tag
             */
            $scope.tagSlide = function (tagName) {
                var element = angular.element(document.querySelector('#' + tagName));
                if ($(element).hasClass('open')) {
                    $(element).removeClass('open');
                } else {
                    $(element).addClass('open');
                }
                $(element.children()[1]).slideToggle();
                // var openElement;
                // if (lastOpen != null) {
                //     var closeElement = angular.element(document.querySelector('#' + lastOpen));
                //     $(closeElement).removeClass('open');
                //     $(closeElement.children()[1]).slideToggle();
                //     if (open != lastOpen) {
                //         openElement = angular.element(document.querySelector('#' + open));
                //         $(openElement).addClass('open');
                //         $(openElement.children()[1]).slideToggle();
                //         lastOpen = open;
                //     } else {
                //         lastOpen = null;
                //     }
                // } else {
                //     openElement = angular.element(document.querySelector('#' + open));
                //     $(openElement).addClass('open');
                //     $(openElement.children()[1]).slideToggle();
                //     lastOpen = open;
                // }
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

            /*
              Show secondary list
             */
            $scope.showSndList = function (selected_team) {
                $localStorage.selectedTeam = selected_team;
                $scope.selectedTeam = selected_team;
                console.log($localStorage.selectedTeam.name);
                $('#second-list').addClass('is-visible');
            };
            $scope.isSelected = function (id) {
                return id === $localStorage.selectedTeam.id;
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
    module.controller('teamController', [
        '$http',
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
                                if(res.data.code == 1){
                                    detail = {
                                        name: res.data.name,
                                        team_id: res.data.team_id,
                                        description: res.data.description,
                                        is_creator: res.data.r_u_creator,
                                        teammates: res.data.users
                                    };
                                    $scope.teamsDetail[$scope.teamsDetail.length] = detail;
                                }else {
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
        function ($scope) {

        }
    ]);
}());