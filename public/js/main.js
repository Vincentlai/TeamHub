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
        'socket.io',
        'chat',
        'event',
        'fileUpload',
        'material.components.eventCalendar',
        'iconUpload'
        //'material.components.expansionPanels'
    ]);
    module
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/overview');
            $stateProvider
                .state('home', {
                    url: "/",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html',
                            controller: 'headerController'
                        },
                        'container': {
                            templateUrl: 'pages/home.html',
                            controller: 'homeController'
                        }
                    },
                    resolve: {
                        information: function ($http, $state, Auth) {
                            return $http.get('/users/my_info')
                                .then(
                                    function (res) {
                                        if(res.data.code == 1){
                                            var url = '/users/download_avatar?user_id=' + res.data.user_id;
                                            var info = {
                                                user: {
                                                    email: res.data.email,
                                                    nickname: res.data.nickname,
                                                    user_id: res.data.user_id,
                                                    current_avatar: url
                                                },
                                                teams: res.data.teams
                                            };
                                            return info;
                                        }else{
                                            Auth.removeCookie();
                                            $state.go('login');
                                        }
                                    },function (error) {
                                        Auth.removeCookie();
                                        console.log('error in get user info' + error);
                                        $state.go('login');
                                    }
                                )
                        }
                    },
                    authenticated: true,
                    abstract: true
                })
                .state('home.overview', {
                    url: 'overview',
                    views: {
                        'contains': {
                            templateUrl: 'pages/overview.html',
                            controller: 'overviewController'
                        }
                    },
                    authenticated: true
                })
                .state('home.setting', {
                    url: 'setting',
                    views: {
                        'contains': {
                            templateUrl: 'pages/setting.html'
                        }
                    },
                    authenticated: true
                })
                .state('home.teams', {
                    url: "teams",
                    views: {
                        'contains': {
                            templateUrl: 'pages/teams.html',
                            controller: 'teamController'
                        }
                    },

                    authenticated: true
                })

                .state('home.chat', {
                    url: ':team_id/chat{.*}',
                    views: {
                        'contains': {
                            templateUrl: 'pages/chat.html',
                            controller: 'ChatController'
                        }
                    },
                    resolve: {
                        'title': function($rootScope, $stateParams){
                            $rootScope.selectedTeamId = $stateParams.team_id;
                        }
                    },
                    authenticated: true
                })
                .state('login', {
                    url: "/login",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {
                            templateUrl: 'pages/login.html',
                            controller: 'login'
                        }
                    },
                    authenticated: false
                })

                .state('signup', {
                    url: "/signup",
                    views: {
                        'navigation': {templateUrl: 'partials/header.html'},
                        'container': {
                            templateUrl: 'pages/signup.html',
                            controller: 'signup'
                        }
                    },
                    authenticated: false
                })
                .state('home.posts', {
                    url: ":team_id/posts",
                    views: {
                        'contains': {
                            templateUrl: 'pages/post.html',
                            controller: 'postController'
                        }
                    },
                    resolve : {
                        postList : function ($http, $stateParams, $rootScope) {
                            return $http.get('posts/get_posts?team_id=' + $stateParams.team_id)
                                .then(
                                    function (res) {
                                        if(res.data.code == 1){
                                            $rootScope.selectedTeamId = $stateParams.team_id;
                                            return res.data.posts;
                                        }
                                    }, function (error) {
                                        console.log('error in getting post list ' + error);
                                    }
                                )
                        }
                    },
                    authenticated: true
                })
                .state('home.events', {
                    url: ":team_id/events",
                    views: {
                        'contains': {
                            templateUrl: 'pages/events.html',
                            controller: 'calendarController'
                        }
                    },
                    authenticated: true
                })
                .state('home.files', {
                    url: ":team_id/files",
                    views: {
                        'contains': {
                            templateUrl: 'pages/files.html'
                        }
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
        '$http',
        function ($rootScope, $state, Auth, $http) {
            // keep user logged in after page refresh
            $rootScope.$on("$stateChangeStart",
                function (event, toState, toParams, fromState, fromParams) {
                    // redirect to login page if not logged in
                    if (!Auth.isLoggedIn()) {
                        $http.get('/users/my_info')
                            .then(function (res) {
                                    if (res.data.code == 1) {
                                        Auth.setCookie(res.data.session_id);
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
                        console.log(Auth.isLoggedIn() + "is logged in ");
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
