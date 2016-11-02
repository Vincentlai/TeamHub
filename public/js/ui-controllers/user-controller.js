/**
 * Created by Qiang Lai on 2016/10/30.
 */
;(function () {
    'use strict';
    var module = angular.module('user-controller', []);
    module.service('UserService',[
        '$http',
        '$timeout',
        function ($http, $timeout) {
            var me = this;
            me.data = {};
            me.login = function() {
                console.log('login');
                $http.post('/users/login', me.data)
                    .then(function (r) {
                        if (r.data.status == 1){
                            me.msg = r.data.msg;
                            me.error = true;
                            $timeout(function () {
                                me.error = false;
                            }, 4000);
                        }else{
                            me.msg = r.data.msg;
                            me.error = true;
                            $timeout(function () {
                                me.error = false;
                            }, 4000);
                        }
                    }, function (e) {
                        console.log(e.data);
                    });
            }
            me.signup = function() {
                console.log('signup');
            //     $http.post('/users/login', me.data)
            //         .then(function (r) {
            //             if (r.data.status == 1){
            //                 me.msg = r.data.msg;
            //                 me.error = true;
            //                 $timeout(function () {
            //                     me.error = false;
            //                 }, 4000);
            //             }else{
            //                 me.msg = r.data.msg;
            //                 me.error = true;
            //                 $timeout(function () {
            //                     me.error = false;
            //                 }, 4000);
            //             }
            //         }, function (e) {
            //             console.log(e.data);
            //         });
             }
        }
    ]);
    module.controller('login', [
        '$scope',
        'UserService',
        function ($scope, UserService)
        {
            $scope.User = UserService;
        }
        ]
    );
    module.controller('signup', [
            '$scope',
            'UserService',
            function ($scope, UserService)
            {
                $scope.User = UserService;
            }
        ]
    );
    var checkPassword = function () {
        return {
            require: "ngModel",
            scope: {
                otherModelVale: "=checkPassword"
            },
            link:
                function(scope, element, attributes, ngModel) {
                    ngModel.$validators.checkPassword = function (value) {
                        return value == scope.otherModelVale;
                    };
                    scope.$watch("otherModelValue", function () {
                      ngModel.$validate();
                    });
                }
        }
    };
    module.directive('checkPassword', checkPassword);
}());