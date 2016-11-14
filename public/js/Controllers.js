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
    module.controller('post', [
            '$scope',
            'PostService',
            function ($scope, PostService) {
                $scope.post = PostService;
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
                            return res.data.code;
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
             Show create team form
             */
            $scope.createForm = function (tag, team_id, name) {
                $scope.seletedTeamId = team_id;
                $scope.seletedTeamName = name;
                $('#' + tag).addClass('is-visible');
            };
            /*
             Close form
             */
            $scope.closeForm = function (tag) {
                delete $scope.seletedTeamId;
                delete $scope.seletedTeamName;
                $('#' + tag).removeClass('is-visible');
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
            $scope.deleteTeam = function () {
                console.log('delete');
                $http.delete('/teams/delete?team_id=' + $scope.seletedTeamId)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('delete-team');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams.manage');
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
                $scope.adduser.team_id = $scope.seletedTeamId;
                $scope.adduser.user_id = 55655;
                $http.post('/teams/add_user', $scope.adduser)
                    .then(
                        function (res) {
                            if (res.data.code == 1){
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    $scope.closeForm('add-user');
                                    delete $scope.msg;
                                    delete $scope.adduser;
                                }, 4000);
                            }else {
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
                $scope.user.team_id = $scope.seletedTeamId;
                $scope.user.user_id = 55655;
                $http.post('/teams/add_user', $scope.user)
                    .then(
                        function (res) {
                            if (res.data.code == 1){
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    $scope.closeForm('add-user');
                                    delete $scope.msg;
                                }, 4000);
                            }else {
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
            }

        }
    ]);
    module.controller('teamDetailController', [
        '$scope',
        '$stateParams',
        '$http',
        '$state',
        '$timeout',
        function ($scope, $stateParams, $http, $state, $timeout) {
            $scope.team_id = $stateParams.team_id;
            $scope.team_name = $stateParams.team_name;

        }
    ]);
    module.controller('chatController', [
        '$scope',
        function ($scope) {

        }
    ]);
}());