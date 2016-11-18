/**
 * Created by Qiang Lai on 2016/11/17.
 */
;(function () {
    'use strict';
    var module = angular.module('event', []);

    module.controller('calendarController', [
        '$scope',
        '$timeout',
        function ($scope, $timeout) {
            //for event test, after passing the test, using database to access events.
            $scope.events = [
                {
                    start: getDate(-6, 0),
                    end: getDate(-4, 0),
                    title: 'Event 1'
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
                if (hour) {
                    date.setHours(hour);
                }
                return date;
            }

            //new///////////////////////////////////////////
            function setDate(time) {
                time = time || 0;
            }

            function createEvent(date) {
                var newEvent = {
                    start: getDate(6, 12),
                    end: getDate(6, 13),
                    allDay: false,
                    title: 'Event new'
                }
            }

            function currentDay(date) {
                return date;
            }

            $scope.eventClicked = function (item) {
                console.log(item);
            };

            $scope.resetTime = function () {
                $scope.eventTimeHour = 0;
                $scope.eventTimeMin = 0;
                //console.log("aaa");
            };

            $scope.createClicked = function (date) {
                console.log(date);
                $scope.showCreateEventForm = true;
                $scope.result = currentDay(date);
                createEvent(date);
            };

            $scope.dis = false;


        }
    ]);
}());