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
        'Controllers',
        'Services',
        'ngCookies',
        'ngPassword',
        'socket.io'
    ]);
    module
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/overview');
            $stateProvider
                .state('home', {
                    url: "/",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {templateUrl: 'pages/home.html'}
                    },
                    controller: 'sideBarController',
                    resolve: {
                        'teams': function () {
                            return ['team1', 'team2'];
                        }
                    },
                    authenticated: true,
                    abstract: true
                })
                .state('home.overview', {
                    url: 'overview',
                    views: {
                        'contains': {
                            templateUrl: 'pages/overview.html'
                        }
                    },
                    authenticated: true
                })
                .state('home.teams', {
                    url: "teams",
                    views: {
                        'contains': {templateUrl: 'pages/teams.html'}
                    },
                    authenticated: true
                })
                .state('home.chat', {
                    url: 'chat',
                    views: {
                        'contains': {templateUrl: 'pages/chat.html'}
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
                })
                .state('home.post', {
                    url: "post",
                    views: {
                        'contains': {templateUrl: 'pages/post.html'}
                    },
                    authenticated: true
                });
        });
    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('teal', {
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
                                    } else {
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
                    } else {
                        console.log(Auth.isLoggedIn().email + "is logged in ");
                        if (!toState.authenticated) {
                            event.preventDefault();
                            return $state.go('home.teams');
                            // if(fromState.name == ''){
                            //     return $state.go('home');
                            // }else{
                            //     return $state.go(fromState.name);
                            // }
                        }
                    }
                });
        }]);

})();
