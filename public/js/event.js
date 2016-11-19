/**
 * Created by Qiang Lai on 2016/11/17.
 */
;(function () {
    'use strict';
    var module = angular.module('event', []);
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

                createdEvent.team_id = "???????";
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
            }

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

}());