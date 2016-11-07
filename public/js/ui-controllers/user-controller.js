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