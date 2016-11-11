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
    module.controller('sideBarController', [
        '$scope',
        '$rootScope',
        '$state',
        function ($scope, $rootScope, $state) {
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
            var lastOpen = null;
            if (lastOpen == null) {
                var element = $state.current.name.replace('home.', '');
                var openElement = angular.element(document.querySelector('#' + element));
                console.log(openElement);
                $(openElement).addClass('open');
                $(openElement.children()[1]).slideToggle();
                lastOpen = element;
                $scope.tagSlide = function (open) {
                    var openElement;
                    if (lastOpen != null) {
                        var closeElement = angular.element(document.querySelector('#' + lastOpen));
                        $(closeElement).removeClass('open');
                        $(closeElement.children()[1]).slideToggle();
                        if (open != lastOpen) {
                            openElement = angular.element(document.querySelector('#' + open));
                            $(openElement).addClass('open');
                            $(openElement.children()[1]).slideToggle();
                            lastOpen = open;
                        } else {
                            lastOpen = null;
                        }
                    } else {
                        openElement = angular.element(document.querySelector('#' + open));
                        $(openElement).addClass('open');
                        $(openElement.children()[1]).slideToggle();
                        lastOpen = open;
                    }
                };

            }
        }
    ]);
}());