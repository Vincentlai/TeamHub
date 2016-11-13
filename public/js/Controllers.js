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
    module.controller('headerCtrl', [
        '$scope',
        'Auth',
        '$state',
        '$http',
        function ($scope, Auth, $state, $http) {
            $scope.isLoggedin = $state.current.authenticated;
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
            }
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
    module.controller('homeController', [
        '$scope',
        '$rootScope',
        '$state',
        'teams',
        '$timeout',
        function ($scope, $rootScope, $state, teams, $timeout) {
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
            $scope.teams = teams;
            $scope.hasNoTeam = ($scope.teams.length === 0);
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
            $scope.createForm = function () {
                $('.popUpWindow').addClass('is-visible');
            };
            /*
                Close form
             */
            $scope.closeForm = function () {

                $('.popUpWindow').removeClass('is-visible');
            };
        }
    ]);
    module.controller('teamController', [
        '$http',
        '$scope',
        '$timeout',
        function ($http, $scope, $timeout) {
            $scope.team = {};
            $scope.createTeam = function () {
                console.log('createTeam clicked');
                $http.post('/teams/create', $scope.team)
                    .then(
                        function (res) {
                            if (res.data.code === 1) {
                                console.log('code = ' + res.data.code);
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                }, 4000);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                }, 4000);
                            }
                        }, function (error) {
                            console.log('error in create teams ' + error);
                        }
                    )
            }
        }
    ]);
    module.controller('teamDetailController',[
        '$scope',
        '$stateParams',
        '$http',
        '$state',
        function ($scope, $stateParams, $http, $state) {
            $scope.team_id = $stateParams.team_id;
            $scope.team_name = $stateParams.team_name;
            $scope.deleteTeam = function () {
                console.log('delete');
                $http.delete('/teams/delete?team_id=' + $scope.team_id)
                    .then(
                        function (res) {
                            if(res.data.code == 1 ){
                                console.log('deleted');
                                $state.transitionTo('home.overview', {}, {
                                    reload: true, inherit: false, notify: false
                                });
                            }else{
                                console.log(res.data.msg);
                                console.log('cannot delete team');
                            }
                        }, function (error) {
                            console.log('error in delete team ' + error);
                        }
                    )
            }
        }
    ]);
    module.controller('chatController', [
        '$scope',
        function ($scope) {

        }
    ]);
}());