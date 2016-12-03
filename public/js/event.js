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
        '$rootScope',
        '$stateParams',
        'eventList',
        function ($http, Auth, $state, $scope,
                  $timeout, $rootScope,
                  $stateParams, eventList) {

            //initial data
            $scope.events = eventList;

            function deleteEventFromDatabase(deleteEventID) {
                $http.delete('/events/delete?event_id=' + deleteEventID)
                    .then(
                        function (response) {
                            if (response.data.code == 1) {
                                console.log("Delete event successfully");
                                //console.log($scope.events[0]);
                                $timeout(function () {
                                    //console.log("working???")
                                    $state.transitionTo($state.current.name, {team_id: $rootScope.selectedTeamId},
                                        {reload: $state.current.name, inherit: false, notify: true});
                                    delete $scope.selectedId;
                                }, 500);

                            } else {
                                console.log("error message in response");
                                console.log(response.data.code);
                            }
                        }, function (error) {
                            console.log('error in delete event info' + error);
                        });
            }

            $scope.deleteEvent = function () {
                deleteEventFromDatabase(deleteEventID);
                $scope.closeForm('display-event');
            };

            $scope.createEvent = function () {
                var createdEvent = {};
                console.log($rootScope.selectedTeamId);
                createdEvent.team_id = $rootScope.selectedTeamId;
                createdEvent.title = $scope.newEventTitle;
                createdEvent.start = new Date($scope.eventStartDate.getTime()
                    + $scope.eventStartTimeHour * 60 * 60 * 1000
                    + $scope.eventStartTimeMin * 60 * 1000);
                createdEvent.end = new Date($scope.eventEndDate.getTime()
                    + $scope.eventEndTimeHour * 60 * 60 * 1000
                    + $scope.eventEndTimeMin * 60 * 1000);
                createdEvent.description = $scope.eventDescription;
                //createdEvent.allDayEvent = $scope.allDayEvent;
                sendToDataBase(createdEvent);
                $scope.closeForm('create-event');
            };

            // $scope.errorMessageShow = function () {
            //     var startTime = $scope.eventStartDate.getTime()
            //         + $scope.eventStartTimeHour * 60 * 60 * 1000
            //         + $scope.eventStartTimeMin * 60 * 1000;
            //     var endTime = $scope.eventEndDate.getTime()
            //         + $scope.eventEndTimeHour * 60 * 60 * 1000
            //         + $scope.eventEndTimeMin * 60 * 1000;
            //     var result = endTime - startTime;
            //     if (result < 0) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // };

            function sendToDataBase(createdEvent) {
                console.log(createdEvent.team_id);
                $http.post('/events/create', createdEvent)
                    .then(
                        function (response) {
                            if (response.data.code == 1) {
                                console.log("seccessfully");
                                $timeout(function () {
                                    //console.log("working???")
                                    $state.transitionTo($state.current.name, {team_id: $rootScope.selectedTeamId},
                                        {reload: $state.current.name, inherit: false, notify: true});
                                    delete $scope.selectedId;
                                }, 500);
                            } else {
                                console.log("error message in response");
                                console.log(response.data.code);
                            }
                        }, function (error) {
                            console.log('error in create events' + error);
                        }
                    )
            }


            function currentDay(date) {
                var tempDate = date.getTime();
                $scope.eventStartDate = new Date(tempDate);
                $scope.eventEndDate = new Date(tempDate);
                return date.toDateString();
            }

            var deleteEventID;
            var chosenEventCreatorID;
            //var chosenEventTitle;
            //var chosenEventStart;
            //var chosenEventEnd;
            //var chosenEventDescription;

            $scope.eventClicked = function (item) {
                $scope.result = item.start.toDateString();
                //console.log($scope.result);
                $scope.showEventInformation = true;
                $scope.showDeleteEventForm = true;
                deleteEventID = item.event_id;
                $scope.chosenEventTitle = item.title;
                $scope.chosenEventStart = item.start.toString();
                $scope.chosenEventEnd = item.end.toString();
                $scope.chosenEventDescription = item.description;
                chosenEventCreatorID = item.creator_id;
                $scope.createForm('display-event');
                console.log(item);
            };

            $scope.createClicked = function (date) {
                console.log(date);
                $scope.result = currentDay(date);
                $scope.showCreateEventForm = true;
                $scope.createForm('create-event');
            };

            $scope.resetTime = function () {
                $scope.eventStartTimeHour = 0;
                $scope.eventStartTimeMin = 0;
                $scope.eventEndTimeHour = 0;
                $scope.eventEndTimeMin = 0;
                //console.log($scope.newEndDate.getTime());
            };

            $scope.isDisabled = function () {
                return ($rootScope.user.user_id != chosenEventCreatorID);
            };

            $scope.dis = false;

        }
    ]);

}());