/**
 * Created by Qiang Lai on 2016/10/29.
 */
;(function () {
    'use strict';
    var module = angular.module('myApp', [
        'socket.io',
        'ui.router',
        'ngMaterial',
        'ngMessages',
        'Controllers',
        'Services',
        'ngCookies',
        'ngPassword',
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
                        'navigation': {
                            templateUrl: 'partials/header.html',
                            controller: 'headerController'
                        },
                        'container': {
                            templateUrl: 'pages/home.html',
                            controller: 'homeController'
                        }
                    },
                    resolve: {
                        'information': function ($http, $state, Auth, $rootScope) {

                            return $http.get('/users/my_info')
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
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
                                            $rootScope.user = info.user;
                                            $rootScope.teams = info.teams;
                                            return info;
                                        } else {
                                            Auth.removeCookie();
                                            $state.go('login');
                                        }
                                    }, function (error) {
                                        Auth.removeCookie();
                                        $state.go('login');
                                    }
                                );
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
                    resolve: {
                        news: function (information, NewsService) {
                            return NewsService.getNews(information.teams);
                        },
                        events: function (information, EventService) {
                            return EventService.getEvents(information.teams);
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
                        'title': function ($rootScope, $stateParams) {
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
                    resolve: {
                        postList: function ($http, $stateParams, $rootScope) {
                            return $http.get('posts/get_posts?team_id=' + $stateParams.team_id)
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            $rootScope.selectedTeamId = $stateParams.team_id;
                                            return res.data.posts;
                                        }
                                    }, function (error) {
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
                    resolve: {
                        eventList: function ($http, $stateParams, $rootScope) {
                            return $http.get('/events/get?team_id=' + $stateParams.team_id + '&current_time= ')
                                .then(
                                    function (res) {
                                        $rootScope.selectedTeamId = $stateParams.team_id;
                                        if (res.data.code == 1) {
                                            var events = res.data.events;
                                            var result = [];
                                            for (var i = 0; i < events.length; i++) {
                                                var event = events[i];
                                                result = result.concat({
                                                    start: new Date(event.start),
                                                    end: new Date(event.end),
                                                    title: event.title,
                                                    event_id: event._id,
                                                    description: event.description,
                                                    creator_id: event.creator_id,
                                                    creator_nickname: event.creator_nickname
                                                });
                                                if(i == events.length -1){
                                                    return result;
                                                }
                                            }

                                        } else {
                                            return [];
                                        }
                                    }, function (error) {
                                    }
                                )
                        }
                    },
                    authenticated: true
                })
                .state('home.files', {
                    url: ":team_id/files",
                    views: {
                        'contains': {
                            templateUrl: 'pages/files.html',
                            controller: 'fileController'
                        }
                    },
                    resolve: {
                        'title': function ($rootScope, $stateParams) {
                            $rootScope.selectedTeamId = $stateParams.team_id;
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
                    $rootScope.is_loading = true;
                    // redirect to login page if not logged in
                    if (!Auth.isLoggedIn()) {
                        $http.get('/users/my_info')
                            .then(function (res) {
                                    if (res.data.code == 1) {
                                        Auth.setCookie(res.data.session_id);
                                    } else {
                                        if (toState.authenticated) {
                                            event.preventDefault();
                                            return $state.go('login');
                                        }
                                    }
                                }, function (error) {
                                }
                            );
                    } else {
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

            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams, options) {
                    $rootScope.is_loading = false;
                    $rootScope.inChatRoomTeamId = '';
                });
        }]);

})
();
