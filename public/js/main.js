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
        'ngCookies',
        'ngPassword'
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
        'AuthService',
        '$http',
        function ($rootScope, $state, Auth, AuthService, $http) {
            // keep user logged in after page refresh
            $rootScope.$on("$stateChangeStart",
                function (event, toState, toParams, fromState, fromParams) {
                    // redirect to login page if not logged in
                    if (!Auth.isLoggedIn()) {
                        $http.get('/users/my_info')
                            .then(function (res) {
                                    if (res.data.code == 1) {
                                        var user = {
                                            'email': res.data.email,
                                            'nickname': res.data.nickname
                                        };
                                        Auth.setCookie(user);
                                    }else{
                                        if (toState.authenticated) {
                                            event.preventDefault();
                                            console.log('No user has logged in.');
                                            return $state.go('login');
                                        }
                                    }
                                }, function (error) {
                                    console.log('Error in Auth. ' + error);
                                }
                            );
                    }else {
                        console.log(Auth.isLoggedIn().email + "is logged in ");
                        if (!toState.authenticated) {
                            event.preventDefault();
                            return $state.go('home');
                            // if(fromState.name == ''){
                            //     return $state.go('home');
                            // }else{
                            //     return $state.go(fromState.name);
                            // }
                        }
                        // console.log(Auth.isLoggedIn().email + "is logged in ");
                    }
                });
        }]);

})();
