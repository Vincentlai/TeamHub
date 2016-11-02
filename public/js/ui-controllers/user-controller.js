/**
 * Created by Qiang Lai on 2016/10/30.
 */
;(function () {
    'use strict';
    var module = angular.module('user-controller', []);
    module.service('UserService',[
        '$http',
        function ($http) {
            var me = this;
            me.data = {};
            me.login = function() {
                console.log('login');
                $http.post('/users/login', me.data)
                    .then(function (r) {
                        if (r.data.status == 1){

                        }else{
                            me.login_failed == true;
                        }
                    }, function (e) {
                        console.log(e.data);
                    });
            }
        }
    ]);
    module.controller('login', [
        '$scope',
        'UserService',
        function ($scope, UserService)
        {
            $scope.User = UserService;
        }]);
}());