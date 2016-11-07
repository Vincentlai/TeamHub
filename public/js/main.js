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
        'user-controller',
        'Services',
        'ngCookies'
    ]);
    module
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                    url: "/",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {templateUrl: 'pages/home.html'}
                    },
                    authenticated: true
                })
                .state('login', {
                    url: "/login",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {templateUrl: 'pages/login.html'}
                    },
                    authenticated: false
                })
                .state('signup', {
                    url: "/signup",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {templateUrl: 'pages/signup.html'}
                    },
                    authenticated: false
                });
        });
    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
                'default': '500'
            })
            .accentPalette('pink');
    });

    module.run(['$rootScope',
        '$state',
        'Auth',
        function ($rootScope, $state, Auth) {
            // keep user logged in after page refresh
            $rootScope.$on("$stateChangeStart",
                function (event, toState, toParams, fromState, fromParams) {
                    // redirect to login page if not logged in

                    if (!Auth.isLoggedIn() && !Auth.checkCookie()) {
                        if (toState.authenticated) {
                            event.preventDefault();
                            console.log('No user has logged in.');
                            return $state.go('login');
                        }
                    } else {
                        if (!toState.authenticated) {
                            event.preventDefault();
                        }
                        // console.log(Auth.isLoggedIn().email + "is logged in ");
                    }
                });
        }]);

})();
