/**
 * Created by Qiang Lai on 2016/10/30.
 */
;(function () {
    'use strict';
    var module = angular.module('Controllers', []);

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
    module.directive('emailExists', [
        '$http',
        function ($http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var ngModel = ctrl;

                    scope.$watch(attrs.ngModel, function (n, o) {
                        if (n !== o) {
                            console.log(n);
                            console.log(o);
                            var url = '/users/is_exist?email=' + n;
                            $http.get(url)
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            ngModel.$setValidity('emailExists', false);
                                        } else {
                                            ngModel.$setValidity('emailExists', true);
                                        }
                                    }, function (error) {
                                        ngModel.$setValidity('emailExists', true);
                                    }
                                );
                        }
                    }, true);
                }
            }
        }
    ]);
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
                            Auth.removeCookie();
                            $state.go('login');
                            return res.data.code;
                        }, function (error) {
                            console.log('Error occurs in Logout' + error);
                        }
                    )
            }
        }
    ]);

    module.controller('calendarController', [
        '$http',
        'Auth',
        '$state',
        '$scope',
        '$timeout',
        function($http,Auth,$state,$scope,$timeout){
            //for event test, after passing the test, using database to access events.
            var newEventDate = new Date(1478592000000);
            $scope.events = [
                {
                    start: newEventDate,
                    end: getDate(0, 0),
                    title: 'Event test'
                },
                {
                    start: getDate(0, 10),
                    end: getDate(1, 11),
                    title: 'Event 1'
                },
                {
                    start: getDate(1, 11),
                    end: getDate(2, 12),
                    title: 'Event 2'
                },
                {
                    start: getDate(2, 12),
                    end: getDate(3, 13),
                    title: 'Event 3'
                },
                {
                    start: getDate(4, 12),
                    end: getDate(5, 13),
                    title: 'Event 4'
                },
                {
                    start: getDate(5, 12),
                    end: getDate(6, 13),
                    title: 'Event 5'
                },
                {
                    start: getDate(6, 12),
                    end: getDate(6, 13),
                    title: 'Event 6'
                },
                {
                    start: getDate(6, 12),
                    allDay: true,
                    title: 'Event 7'
                }
            ];

            $scope.selected = $scope.events[0];
            $scope.showCreateEventForm = false;

            function getDate(offsetDays, hour) {
                offsetDays = offsetDays || 0;
                var offset = offsetDays * 24 * 60 * 60 * 1000;
                var date = new Date(new Date().getTime() + offset);
                if (hour) { date.setHours(hour); }
                return date;
            }
            //new///////////////////////////////////////////
            function setDate(time){
                time = time || 0;
            }

            $scope.createEvent = function(){
                console.log(" working ");
                var createdEvent = {};

                createdEvent.team_id = "???????"
                createdEvent.title = $scope.newEventTitle;
                createdEvent.start = new Date($scope.eventStartDate.getTime() 
                                            + $scope.eventStartTimeHour*60*60*1000 
                                            + $scope.eventStartTimeMin*60*1000);
                createdEvent.end = new Date($scope.eventEndDate.getTime() 
                                            + $scope.eventEndTimeHour*60*60*1000 
                                            + $scope.eventEndTimeMin*60*1000);
                createdEvent.description = $scope.eventDescription;
                //createdEvent.allDayEvent = $scope.allDayEvent;
                console.log(createdEvent.start);
                console.log(createdEvent.end);
                console.log(createdEvent.title);
                console.log(createdEvent.description);
                console.log(createdEvent.allDayEvent);
                console.log(createdEvent);
                sendToDataBase(createdEvent);
            };

            function sendToDataBase(createdEvent){
                $http.post('/events/create', createdEvent)
                .then(
                    function(response){
                        if(response.data.code == 1){
                            console.log("seccessfully");
                        } else{
                            console.log("error message in response");
                        }
                    }, function(error){
                        console.log('error in create events' + error);
                    }
                )
            };

            function currentDay(date){
                var tempDate = date.getTime();
                $scope.eventStartDate = new Date(tempDate);
                $scope.eventEndDate = new Date(tempDate);
                return date.toDateString();
            }

            $scope.eventClicked = function (item) {
                console.log(item);
            };

            $scope.resetTime = function(){
                $scope.eventStartTimeHour = 0;
                $scope.eventStartTimeMin = 0;
                $scope.eventEndTimeHour = 0;
                $scope.eventEndTimeMin = 0;
                //console.log($scope.newEndDate.getTime());
            };

            $scope.createClicked = function (date) {
                console.log(date);
                $scope.result = currentDay(date);
                $scope.showCreateEventForm = true;
                console.log(date.getTime());
            };

            $scope.dis = false;



    }
    ]);

    module.controller('post', [
            '$scope',
            'PostService',
            function ($scope, PostService) {
                $scope.post = PostService;
            }
        ]
    );
    module.controller('sideBarController', [
        '$scope',
        '$rootScope',
        '$state',
        function ($scope, $rootScope, $state, teams) {
            // $scope.$watch(function () {
            //     return $state.$current.name;
            // }, function (newState, oldState) {
            //     var element = newState.replace('home.', '');
            //     var openElement = angular.element(document.querySelector('#' + element));
            //     $(openElement).addClass('open');
            //     if (newState !== oldState) {
            //         element = oldState.replace('home.', '');
            //         var closeElement = angular.element(document.querySelector('#' + element));
            //         $(closeElement).removeClass('open');
            //         $(closeElement.children()[1]).slideToggle();
            //     } else {
            //         $(openElement.children()[1]).slideToggle();
            //     }
            // }, true);
            var lastOpen = null;
            if (lastOpen == null) {
                var element = $state.current.name.replace('home.', '');
                var openElement = angular.element(document.querySelector('#' + element));
                console.log(openElement);
                $(openElement).addClass('open');
                $(openElement.children()[1]).slideToggle();
                lastOpen = element;
                $scope.tagSlide = function (open) {
                    var openElement;
                    if (lastOpen != null) {
                        var closeElement = angular.element(document.querySelector('#' + lastOpen));
                        $(closeElement).removeClass('open');
                        $(closeElement.children()[1]).slideToggle();
                        if (open != lastOpen) {
                            openElement = angular.element(document.querySelector('#' + open));
                            $(openElement).addClass('open');
                            $(openElement.children()[1]).slideToggle();
                            lastOpen = open;
                        } else {
                            lastOpen = null;
                        }
                    } else {
                        openElement = angular.element(document.querySelector('#' + open));
                        $(openElement).addClass('open');
                        $(openElement.children()[1]).slideToggle();
                        lastOpen = open;
                    }
                };
                $scope.teams = teams;
                console.log($scope.teams);
            }
        }
    ]);
}());