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
                    templateUrl: 'pages/login.ejs',
                    resolve: {
                        'title': ['$rootScope', function($rootScope){
                            $rootScope.title = "Home";
                        }]
                    }
                })
                .state('signup', {
                    url: "/signup",
                    templateUrl: 'pages/signup.ejs'
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
