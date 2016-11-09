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
            link: function (scope, ele, attrs, ctrl, ngModel) {

                // console.log(scope);
                // console.log(attrs);
                // console.log(ctrl);
                var taget = attrs["equalTo"];
                if (taget) {
                    scope.$watch(taget, function () {
                        ctrl.$validate()
                    });
                    var tagetCtrl = ctrl.$$parentForm[taget];
                    console.log(tagetCtrl);
                    ctrl.$validators.equalTo = function (modelValue, viewValue) {
                        var targetValue = tagetCtrl.$viewValue;
                        console.log(targetValue == viewValue);
                        return targetValue == viewValue;
                    };


                }
            }}
        });
}());