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
    module.controller('headerCtrl',[
        '$scope',
        'Auth',
        '$state',
        '$http',
       function ($scope, Auth, $state, $http) {
           $scope.isLoggedin = Auth.isLoggedIn();
           $scope.logout = function () {
               $http.post('/users/logout')
                   .then(
                       function (res) {
                           if(res.data.code == 1){
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
    var checkPassword = function () {
        return {
            require: "ngModel",
            scope: {
                otherModelVale: "=checkPassword"
            },
            link: function (scope, element, attributes, ngModel) {
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