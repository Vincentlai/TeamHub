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
    module.directive('emailNotexists', [
        '$http',
        function ($http) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var ngModel = ctrl;

                    scope.$watch(attrs.ngModel, function (n, o) {
                        if (n !== o) {
                            var url = '/users/is_exist?email=' + n;
                            $http.get(url)
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            ngModel.$setValidity('emailNotexists', true);
                                        } else {
                                            ngModel.$setValidity('emailNotexists', false);
                                        }
                                    }, function (error) {
                                        ngModel.$setValidity('emailNotexists', false);
                                    }
                                );
                        }
                    }, true);
                }
            }
        }
    ]);
    module.filter('dateFilter', [
        function () {
            return function (millisecond) {
                var now = new Date();
                var timeStamp = millisecond.substring(0, 8);
                var date = new Date(parseInt(timeStamp, 16) * 1000);
                if (now.getFullYear() > date.getFullYear()) {
                    if (now.getFullYear() - date.getFullYear() == 1) {
                        return "in 1 year ago";
                    } else {
                        return "in " + (now.getFullYear() - date.getFullYear()) + ' years ago';
                    }
                }
                if (now.getMonth() > date.getMonth()) {
                    if (now.getMonth() - date.getMonth() == 1) {
                        return "in 1 month ago";
                    } else {
                        return "in " + (now.getMonth() - date.getMonth()) + ' months ago';
                    }
                }
                if (now.getDay() > date.getDay()) {
                    if (now.getDay() - date.getDay() == 1) {
                        return "in 1 day ago";
                    } else {
                        return "in " + (now.getDay() - date.getDay()) + ' days ago';
                    }
                }
                if (now.getHours() > date.getHours()) {
                    if (now.getHours() - date.getHours() == 1) {
                        return "in 1 hour ago";
                    } else {
                        return "in " + (now.getHours() - date.getHours()) + ' hours ago';
                    }
                }
                if (now.getMinutes() > date.getMinutes()) {
                    if (now.getMinutes() - date.getMinutes() == 1) {
                        return "in 1 minute ago";
                    } else {
                        return "in " + (now.getMinutes() - date.getMinutes()) + ' minutes ago';
                    }
                }
                return "just now";
            }
        }
    ]);
    module.controller('headerController', [
        '$scope',
        'Auth',
        '$state',
        '$http',
        '$rootScope',
        'UserService',
        function ($scope, Auth, $state, $http, $rootScope, UserService) {
            $rootScope.logout = function () {
                UserService.logout(function () {
                    delete $rootScope.user;
                    $state.go('login');
                });
            };
        }
    ]);
    module.controller('postController', [
            '$scope',
            'postList',
            '$state',
            '$http',
            '$timeout',
            '$rootScope',
            'ErrorService',
            function ($scope, postList, $state, $http, $timeout, $rootScope, ErrorService) {
                /*
                 keys in post list item
                 comments   Array
                 like
                 nickname
                 creator_id
                 post_id
                 text
                 time
                 */
                $scope.postList = postList;
                $scope.numOfPosts = $scope.postList.length;
                $scope.input = {};
                $scope.createPost = function () {
                    $http.post('/posts/post', {
                        text: $scope.input.description,
                        team_id: $rootScope.selectedTeamId
                    })
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    $scope.closeForm('create-post');
                                    $timeout(
                                        function () {
                                            $state.transitionTo($state.current.name, {team_id: $rootScope.selectedTeamId},
                                                {reload: $state.current.name, inherit: false, notify: true});
                                        }, 500);
                                } else {
                                    $scope.errorNotify = ErrorService;
                                    ErrorService.displayError(res.data.msg);
                                }
                            }, function (error) {
                                console.log('error in creating post ' + error);
                            }
                        )
                };
                $scope.deletePost = function (id) {
                    console.log('delete post clicked' + id);
                    $http.delete('/posts/delete?post_id=' + id)
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    $scope.closeForm('delete-post');
                                    $timeout(function () {
                                        $state.transitionTo($state.current.name, {team_id: $rootScope.selectedTeamId},
                                            {reload: $state.current.name, inherit: false, notify: true});
                                        delete $scope.selectedId;
                                    }, 500);
                                } else {
                                    $scope.msg = res.data.msg;
                                    $scope.error = true;
                                    $timeout(function () {
                                        $scope.error = false;
                                        delete $scope.msg;
                                    }, 4000);
                                    console.log('cannot delete post');
                                }
                            }, function (error) {
                                console.log('error in delete post ' + error);
                            }
                        )
                };

                $scope.createComment = function (id,index) {
                    console.log('create comment');
                    $scope.index = index;
                    $http.post('/posts/comment', {
                        comment: $scope.input.comment,
                        post_id: id
                    })
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    $scope.postList[$scope.index].comments.push(
                                        {
                                            user_id: res.data.user_id,
                                            nickname: res.data.nickname,
                                            comment: res.data.comment,
                                            time: res.data.time
                                        }
                                    );
                                } else {
                                    console.log(res.data.msg);
                                }
                            }, function (error) {
                                console.log('error in adding comment ' + error);
                            }
                        )
                };
                $scope.likeOrUnlike = function (id, flag, index) {
                    $scope.index = index;
                    $http.post('/posts/likeOrUnlike', {
                        post_id: id,
                        flag: flag
                    })
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    $scope.postList[$scope.index].likes.unshift(
                                        {
                                            user_id: $scope.user.user_id,
                                            nickname: $scope.user.nickname
                                        }
                                    );
                                    $scope.postList[$scope.index].isLiked = true;
                                } else if (res.data.code == 2) {
                                    // unlike confirmed
                                    var j;
                                    for (var i = 0; i <= $scope.postList[$scope.index].likes.length; i++) {
                                        if ($scope.postList[$scope.index].likes[i].user_id == $scope.user.user_id) {
                                            j = i;
                                            break;
                                        }
                                    }
                                    $scope.postList[$scope.index].likes.splice(j, 1);
                                    $scope.postList[$scope.index].isLiked = false;
                                } else {
                                    console.log('cannot like or unlike');
                                }
                            }, function (error) {
                                console.log('error in like or unlike ' + error);
                            }
                        )
                };

                //click button to show comments
                $scope.showComments = function(index){

                };

            }
        ]
    );

    module.controller('homeController', [
        '$scope',
        '$rootScope',
        '$state',
        'information',
        '$timeout',
        'ErrorService',
        'TeamService',
        function ($scope, $rootScope, $state, information, $timeout, ErrorService, TeamService) {
            $scope.teams = information.teams;
            $scope.hasNoTeam = ($scope.teams.length === 0);
            $rootScope.user = information.user;

            $scope.openTag = function () {
                for (var i = 0; i < $scope.teams.length; i++) {
                    if ($scope.teams[i].id == $rootScope.selectedTeamId) {
                        $scope.index = i;
                        $timeout(function () {
                            $scope.tagSlide('teams' + $scope.index);
                        }, 10);
                        break;
                    }
                }
            };

            $scope.$watch(function () {
                return $state.$current.name;
            }, function (newState, oldState) {
                $scope.isManage = (newState.includes('teams'));
                $scope.isOverview = (newState.includes('overview'));
                $scope.isPost = (newState.includes('post'));
                $scope.isEvent = (newState.includes('event'));
                $scope.isChat = (newState.includes('chat'));
                $scope.isFile = (newState.includes('file'));
            });

            /*
             Open or close tag
             */
            $scope.tagSlide = function (tagName) {
                var element = angular.element(document.querySelector('#' + tagName));
                if ($(element).hasClass('open')) {
                    $(element).removeClass('open');
                } else {
                    $(element).addClass('open');
                }
                $(element.children()[1]).slideToggle();
            };


            $scope.isSelected = function (id) {
                return id === $rootScope.selectedTeamId;
            };

            /*
             Show team form
             */
            $scope.createForm = function (tag, id, name, teammates) {
                $scope.input = {};
                if (tag.includes('post')) {
                    $scope.selectedId = id;
                } else {
                    $scope.input.team_id = id;
                }
                $scope.selectedName = name;
                $scope.selectedTeamTeammates = teammates;
                $('#' + tag).addClass('is-visible');
            };
            /*
             Close team form
             */
            $scope.closeForm = function (tag, reset) {
                $('#' + tag).removeClass('is-visible');
                if (reset) {
                    reset.$setPristine();
                    reset.$setUntouched();
                }
            };

            $scope.createTeam = function () {

                TeamService.createTeam($scope.input, function (r, msg) {
                    if (r) {
                        $scope.closeForm('create-team');
                        $timeout(
                            function () {
                                $scope.$emit('ChangeTeam', $state.$current);
                            }, 500);
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };


            $scope.changeID = function (id) {
                $rootScope.selectedTeamId = id;
            };
            $rootScope.clear = function () {
                delete $rootScope.selectedTeamId;
            };

            /*
             Reload side bar when add or delete team
             */
            $scope.$on('ChangeTeam',
                function (event, args) {
                    $state.transitionTo(args, null, {reload: true, inherit: false, notify: true});
                });
        }
    ]);

    module.controller('overviewController', [
        '$scope',
        '$rootScope',
        '$state',
        '$timeout',
        '$http',
        function ($scope, $rootScope, $state, $timeout, $http) {

            $scope.loadNews = function () {
                $scope.news = [];
                for (var i = 0; i < $scope.teams.length; i++) {
                    $http.get('/teams/news?team_id=' + $scope.teams[i].id)
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    var news;
                                    for (var j = 0; j < res.data.news.length; j++) {
                                        news = {
                                            user_id: res.data.news[j].user_id,
                                            user_nickname: res.data.news[j].user_nickname,
                                            action_name: res.data.news[j].action_name,
                                            action_target: res.data.news[j].action_target,
                                            action_target_id: res.data.news[j].action_target_id,
                                            time_in_mili: res.data.news[j]._id.toString(),
                                            target_team: res.data.news[j].target_team_name
                                        };
                                        $scope.news.unshift(news);
                                    }
                                }
                            }, function (error) {
                                console.log('error in calling team new');
                            }
                        )
                }
                // $scope.number_of_selected_filter = $scope.news.length;
                // $scope.current_number_of_selected_filter = 0;
                // $scope.filter_limite = 10;
                $scope.filter_team_name = 'All Teams';
                $scope.filter_team_id = '';
            };
            $scope.selectFilter = function (id, name) {
                if (id == '') {
                    $scope.filter_team_name = 'All Teams';
                } else {
                    $scope.filter_team_name = name;
                }
                $scope.filter_team_id = id;
            };
            $scope.filterTeam = function (item) {
                if (($scope.filter_team_id == '')) {
                    $scope.current_number_of_selected_filter++;
                    return true;
                }
                if ($scope.filter_team_name == item.target_team) {
                    return true;
                }
                return false;
            };
            // $scope.loadMore = function () {
            //     $scope.filter_limite += 10;
            // };
            // $scope.$watch(function () {
            //         return $scope.filter_team_name;
            //     }, function (n, o) {
            //         if(n != o){
            //             $scope.current_number_of_selected_filter = 0;
            //             $scope.filter_limite = 10;
            //         }
            //     }, true
            // )
        }
    ]);
    module.controller('teamController', [
        '$scope',
        '$timeout',
        '$state',
        'ErrorService',
        'TeamService',
        function ($scope, $timeout, $state, ErrorService, TeamService) {
            $scope.team = {};
            $scope.numOfTeams = $scope.teams.length;
            $scope.loadTeamDetail = function () {
                $scope.teamsDetail = [];
                for (var i = 0; i < $scope.teams.length; i++) {
                    TeamService.teamsDetail($scope.teams[i].id, function (r, data) {
                        if (r) {
                            $scope.teamsDetail.push(data);
                        } else {
                            $scope.teamsDetail.push({});
                        }
                    });
                }
            };

            /**
             * Close open form and refresh page when success
             * @param tag the id of the pop window
             */
            var successFunc = function (tag) {
                $scope.closeForm(tag);
                $timeout(function () {
                    $scope.$emit('ChangeTeam', $state.current);
                }, 500);
            };

            $scope.deleteTeam = function () {
                TeamService.deleteTeam($scope.input.team_id, function (r, msg) {
                    if (r) {
                        successFunc('delete-team');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };

            $scope.addUser = function () {
                TeamService.addUser($scope.input, function (r, msg) {
                    if (r) {
                        successFunc('add-user');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };

            $scope.removeUser = function () {
                console.log($scope.input);
                TeamService.removeUser($scope.input, function (r, msg) {
                    if (r) {
                        successFunc('remove-user');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };

            $scope.quitTeam = function () {
                TeamService.quitTeam($scope.input.team_id, function (r, msg) {
                    if (r) {
                        successFunc('quit-team');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };


        }
    ]);
    // module.controller('teamDetailController', [
    //     '$scope',
    //     '$stateParams',
    //     '$http',
    //     '$state',
    //     '$timeout',
    //     function ($scope, $stateParams, $http, $state, $timeout) {
    //         $scope.team_id = $stateParams.team_id;
    //         $scope.team_name = $stateParams.team_name;
    //
    //     }
    // ]);
    module.controller('chatController', [
        '$scope',
        '$rootScope',
        function ($scope, $rootScope) {

        }
    ]);

    module.directive('errorNotify', function () {
        return {
            templateUrl: '/partials/notify.html'
        }
    })

}());