/**
 * Created by Qiang Lai on 2016/10/29.
 */
;(function () {
    'use strict';
    console.log('I am myapp module');
    var module = angular.module('myApp', [
        'ui.router',
        'ngMaterial',
        'ngMessages',
        'user-controller'
    ]);
    module
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                    url: "/",
                    views: {
                        'navigation': {templateUrl:'partials/header.html'},
                        'container': {templateUrl:'pages/login.html'}
                    },
                    resolve: {
                        'title': ['$rootScope', function($rootScope){
                            $rootScope.title = "Home";
                        }]
                    }
                })
                .state('signup', {
                    url: "/signup",
                    views: {
                        'navigation': {templateUrl:'partials/header.html'},
                        'container': {templateUrl:'pages/signup.html'}
                    }
                });
        });
    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
                'default': '500'
            })
            .accentPalette('pink');
    });

})();
