/**
 * Created by Qiang Lai on 2016/10/30.
 */
;(function () {
    'use strict';
    var module = angular.module('user-controller', []);

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
    module.directive("equalTo", function () {
        return {
            require: "ngModel",
            link: function (scope, ele, attrs, ctrl) {

                console.log(scope);//打印当前作用域
                console.log(attrs);//打印当前标签属性列表
                console.log(ctrl);//打印当前ctrl


                }
            }
    });
}());