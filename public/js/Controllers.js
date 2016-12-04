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

    module.filter('action', [
        function () {
            return function (action_name) {
                switch (action_name) {
                    case 'created':
                        return 'to';
                    case 'deleted':
                        return 'from';
                    default:
                        return 'to';
                }
            }
        }

    ]);

    module.filter('eventDateFilter', [
        function () {
            return function (d) {
                var now = Date.now();
                var year = 60 * 60 * 24 * 365 * 1000;
                var month = 60 * 60 * 24 * 31 * 1000;
                var week = 60 * 60 * 24 * 7 * 1000;
                var day = 60 * 60 * 24 * 1000;
                var hour = 60 * 60 * 1000;
                var minute = 60 * 1000;
                var diff = d - now;
                var multi = function (time) {
                    return 'in ' + Math.floor(diff / time);
                };
                if (diff > year * 2) {
                    return multi(year) + ' years';
                }
                if (diff >= year && diff <= year * 2) {
                    return 'in 1 year';
                }
                if (diff < year && diff >= month * 2) {
                    return multi(month) + ' months';
                }
                if (diff < month * 2 && diff >= month) {
                    return 'in 1 month';
                }
                if (diff < month && diff >= week * 2) {
                    return multi(week) + ' weeks';
                }
                if (diff < week * 2 && diff >= week) {
                    return 'in 1 week';
                }
                if (diff < week && diff >= day * 2) {
                    return multi(day) + ' days';
                }
                if (diff < day * 2 && diff >= day) {
                    return 'in 1 day';
                }
                if (diff < day && diff >= hour * 2) {
                    return multi(hour) + ' hours';
                }
                if (diff < hour * 2 && diff >= hour) {
                    return 'in 1 hour';
                }
                if (diff < hour && diff >= minute * 2) {
                    return multi(minute) + ' minutes';
                }
                return 'soon';
            }
        }

    ]);


    module.filter('dateFilter', [
        function () {
            return function (date) {
                var now = Date.now();
                var year = 60 * 60 * 24 * 365 * 1000;
                var month = 60 * 60 * 24 * 31 * 1000;
                var week = 60 * 60 * 24 * 7 * 1000;
                var day = 60 * 60 * 24 * 1000;
                var hour = 60 * 60 * 1000;
                var minute = 60 * 1000;
                var diff = now - date;
                var multi = function (time) {
                    return Math.floor(diff / time);
                };
                if (diff > year * 2) {
                    return multi(year) + ' years ago';
                }
                if (diff >= year && diff <= year * 2) {
                    return '1 year ago';
                }
                if (diff < year && diff >= month * 2) {
                    return multi(month) + ' months ago';
                }
                if (diff < month * 2 && diff >= month) {
                    return '1 month ago';
                }
                if (diff < month && diff >= week * 2) {
                    return multi(week) + ' weeks ago';
                }
                if (diff < week * 2 && diff >= week) {
                    return '1 week ago';
                }
                if (diff < week && diff >= day * 2) {
                    return multi(day) + ' days ago';
                }
                if (diff < day * 2 && diff >= day) {
                    return '1 day ago';
                }
                if (diff < day && diff >= hour * 2) {
                    return multi(hour) + ' hours ago';
                }
                if (diff < hour * 2 && diff >= hour) {
                    return '1 hour ago';
                }
                if (diff < hour && diff >= minute * 2) {
                    return multi(minute) + ' minutes ago';
                }
                return 'just now';

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
        '$socket',
        function ($scope, Auth, $state, $http, $rootScope, UserService, $socket) {

            //initial data
            var my_id = $rootScope.user.user_id;

            $scope.notif_list = [];
            $scope.showNotif = false;

            $rootScope.logout = function () {
                UserService.logout(function () {
                    delete $rootScope.user;
                    $state.go('login');
                });
            };

            $scope.showNotification = function () {
                if ($scope.notif_list.length != 0) {
                    $scope.showNotif = !$scope.showNotif;
                    $scope.num_of_notif = undefined;
                    console.log($scope.notif_list);
                }
            };

            $socket.on('teamNotif', function (json) {
                if (json.user_id == my_id) {

                    if ($scope.num_of_notif) {
                        $scope.num_of_notif++;
                    } else {
                        $scope.num_of_notif = 1;
                    }
                    $scope.notif_list.unshift(json);
                }
            });


            /* on receive NEW team activity */
            $socket.on('notification', function (json) {

                var teams = $rootScope.teams;
                var inChatRoomTeamId = $rootScope.inChatRoomTeamId;

                for (var i = 0; i < teams.length; i++) {

                    if (teams[i].id == json.team_id
                        && my_id != json.user_id
                        && inChatRoomTeamId != json.team_id) {

                        // if new comment and like is not for my post
                        if (json.owner_id) {
                            if (json.owner_id != my_id) {
                                return;
                            }
                        }

                        json.team_name = teams[i].name;

                        if ($scope.num_of_notif) {
                            $scope.num_of_notif++;
                        } else {
                            $scope.num_of_notif = 1;
                        }

                        // add to the list
                        var found = false;
                        for (var j = 0; j < $scope.notif_list.length; j++) {
                            // same action from same person increment #
                            if ($scope.notif_list[j].type == json.type
                                && $scope.notif_list[j].team_id == json.team_id) {
                                $scope.notif_list[j].number++;
                                $scope.notif_list[j].msg = 'You have ' + $scope.notif_list[j].number + ' new ' +
                                    $scope.notif_list[j].type + ' in ' + $scope.notif_list[j].team_name + '.'
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            $scope.notif_list.unshift({
                                type: json.type,
                                nickname: json.nickname,
                                team_name: json.team_name,
                                team_id: json.team_id,
                                user_id: json.user_id,
                                number: 1,
                                msg: 'You have 1 new ' + json.type + ' in ' + json.team_name + '.'
                            });
                        }
                        console.log($scope.notif_list.length);

                        break;
                    }
                }
            });

            $scope.hover_msg = function () {
                if (!$scope.num_of_notif) {
                    return 'No New Notification';
                } else if ($scope.num_of_notif == 1) {
                    return '1 New Notification';
                } else if ($scope.num_of_notif > 1) {
                    return $scope.num_of_notif + ' New Notifications';
                }
            }
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
            'PostService',
            'Upload',
            '$q',
            function ($scope, postList, $state, $http, $timeout, $rootScope, ErrorService, PostService, Upload, $q) {

                $scope.postList = postList;
                $scope.postList.forEach(function (post) {
                    post.visibleComment = false;
                });
                $scope.isPosting = false;
                $scope.isDeleting = false;
                $scope.numOfPosts = $scope.postList.length;

                //initialize file upload array
                $scope.post_files = [];
                $scope.invalid_input = false;
                var posted_files = [];
                $scope.input = {};
                $scope.errorNotify = ErrorService;
                var addNewComment = function (data, index) {
                    var comment = {
                        user_id: data.user_id,
                        nickname: data.nickname,
                        comment: data.comment,
                        time: new Date(parseInt(data.time.toString().substring(0, 8), 16) * 1000)
                    };
                    console.log(comment);
                    $scope.postList[index].commentList.push(comment);
                    $scope.postList[index].comments++;
                };
                $scope.createPost = function () {
                    console.log('create post');
                    if ($scope.isPosting) {
                        return;
                    }
                    $scope.isPosting = true;
                    var promises = [];

                    angular.forEach($scope.post_files, function (file, index) {
                        $scope.post_files[index].isLoading = true;

                        var deferred = $q.defer();
                        Upload.upload({
                            url: '/files/upload',
                            data: {
                                team_id: $rootScope.selectedTeamId,
                                file: file,
                                file_name: file.name,
                                file_size: file.size,
                                is_pic: true
                            }
                        }).then(function (res) {
                            $scope.post_files[index].isLoading = false;
                            if (res.data.code == 1) {
                                var result = {
                                    file_id: res.data.file_id,
                                    file_name: res.data.file_name
                                };
                                posted_files.push(result);
                                deferred.resolve(res.data.msg);
                            } else {

                                deferred.reject(res.data.msg);
                                console.log(res.data.msg);
                            }
                        }, function (error) {
                            $scope.post_files[index].isLoading = false;
                            deferred.reject(error);
                            console.error(error);
                        });
                        promises.push(deferred.promise);
                    });

                    $q.all(promises).then(
                        function (res) {

                            $http.post('/posts/post', {
                                text: $scope.input.description,
                                team_id: $rootScope.selectedTeamId,
                                files: posted_files
                            })
                                .then(
                                    function (res) {
                                        if (res.data.code == 1) {
                                            $timeout(
                                                function () {
                                                    $scope.isPosting = false;
                                                    $scope.closeForm('create-post');
                                                    $state.transitionTo($state.current.name, {team_id: $rootScope.selectedTeamId},
                                                        {reload: $state.current.name, inherit: false, notify: true});
                                                }, 1000);
                                        } else {
                                            ErrorService.displayError(res.data.msg);
                                        }
                                    }, function (error) {
                                        console.log('error in creating post ' + error);
                                    }
                                )
                        }, function (error) {
                            $scope.isPosting = false;
                            ErrorService.displayError("Error in posting...");
                            console.log(error);
                        }
                    );
                };

                $scope.deletePost = function (id) {
                    if ($scope.isDeleting) {
                        return;
                    }

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
                $scope.createComment = function (id, index) {
                    console.log('create comment');
                    var input = document.getElementById('comment-input' + index).value;
                    if (input == '')
                        return;
                    $scope.index = index;
                    $http.post('/posts/comment', {
                        comment: input,
                        post_id: id
                    })
                        .then(
                            function (res) {
                                if (res.data.code == 1) {
                                    document.getElementById('comment-input' + index).value = '';
                                    if (angular.isUndefined($scope.postList[index].commentList)) {
                                        $scope.getComments(index, id);
                                        $scope.postList[index].visibleComment = true;
                                    } else {
                                        addNewComment(res.data, index);
                                    }
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

                $scope.getComments = function (index, id) {
                    console.log('load comments');
                    PostService.getComments(id, function (comments) {
                        $scope.postList[index].commentList = comments;
                        $scope.postList[index].comments = $scope.postList[index].commentList.length;
                    });
                };
                //click button to show comments
                $scope.showComments = function (index, id) {
                    $scope.postList[index].visibleComment = !$scope.postList[index].visibleComment;
                    if (angular.isUndefined($scope.postList[index].commentList)) {
                        $scope.getComments(index, id);
                    }
                };

                // delete comment
                $scope.deleteComment = function (postCard, comment) {
                    console.log('delete comment');
                    var post_id = postCard.post_id;
                    var comment_id = comment.comment_id;
                    PostService.deleteComment(post_id, comment_id, function () {
                        PostService.getComments(post_id, function (comments) {
                            postCard.commentList = comments;
                            postCard.comments = postCard.commentList.length;
                        });
                    })
                };


                //get file name and size from input

                var handleFileSelect = function (event) {
                    for (var i = 0; i < event.currentTarget.files.length; i++) {
                        var v = event.currentTarget.files[i];
                        v.isLoading = false;
                        if (v.type.includes('image')) {
                            v.isLoading = false;
                            $scope.$apply(function (v) {
                                $scope.post_files.push(v);
                            }(v));
                        } else {
                            console.log('not image');
                        }
                    }
                };

                angular.element(document.querySelector('#addFile')).on('change', handleFileSelect);

                $scope.selectUrl = function (post, id) {
                    post.selectedUrl = '/files/download?file_id=' + id;
                };
                $scope.unselectUrl = function (post) {
                    post.selectedUrl = null;
                };
                $scope.cancelFile = function (index) {
                    $scope.post_files.splice(index, 1);
                }

            }
        ]
    );

    module.controller('homeController', [
        '$scope',
        '$rootScope',
        '$state',
        '$timeout',
        'ErrorService',
        'TeamService',
        '$socket',
        function ($scope, $rootScope, $state, $timeout, ErrorService, TeamService, $socket) {
            $scope.hasNoTeam = ($rootScope.teams.length === 0);

            $scope.openTag = function () {
                for (var i = 0; i < $rootScope.teams.length; i++) {
                    if ($rootScope.teams[i].id == $rootScope.selectedTeamId) {
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
        'news',
        'events',
        function ($scope, $rootScope, $state, $timeout, $http, news, events) {

            // initial vars
            $scope.news = news;
            $scope.events = events;
            $scope.filter_team_name = 'All Teams';
            $scope.filter_team_id = '';
            $scope.limit_news = 20;
            var loadMore = function () {
                if ($scope.limit_news <= $scope.news.length) {
                    $scope.$apply(function ($scope) {
                        $scope.limit_news += 10;

                    });

                }
            };
            // filter for selected team news
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

            $('#news-list').bind("scroll", function (e) {
                var height = (document.getElementById('news-list').scrollHeight -
                    document.getElementById('news-list').scrollTop) - document.getElementById('news-list').offsetHeight;
                if (height <= 15) {
                    loadMore();
                }
            });

            $scope.goToPage = function (name, team_id) {
                switch (name) {
                    case 'post':
                        $state.go('home.posts', {team_id: team_id});
                        break;
                    case 'file':
                        $state.go('home.files', {team_id: team_id});
                        break;
                    case 'event':
                        $state.go('home.events', {team_id: team_id});
                        break;
                    default :
                        return;
                }
            };

            var check_days = function (date) {
                var now = Date.now();
                var day = 60 * 60 * 24 * 1000;
                var diff = date - now;
                return Math.floor(diff / day);
            };

            $scope.isWarning = function (date) {
                return check_days(date) > 3 && check_days(date) <= 7;
            };
        }
    ]);
    module.controller('teamController', [
        '$scope',
        '$timeout',
        '$state',
        'ErrorService',
        'TeamService',
        '$rootScope',
        function ($scope, $timeout, $state, ErrorService, TeamService, $rootScope) {
            $scope.team = {};
            $scope.numOfTeams = $rootScope.teams.length;

            $scope.loadTeamDetail = function () {
                $scope.teamsDetail = [];
                for (var i = 0; i < $rootScope.teams.length; i++) {
                    TeamService.teamsDetail($rootScope.teams[i].id, function (r, data) {
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
                    if (r == 1) {
                        successFunc('delete-team');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };

            $scope.addUser = function () {
                TeamService.addUser($scope.input, function (r, msg) {
                    if (r == 1) {
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
                    if (r == 1) {
                        successFunc('remove-user');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };

            $scope.quitTeam = function () {
                TeamService.quitTeam($scope.input.team_id, function (r, msg) {
                    if (r == 1) {
                        successFunc('quit-team');
                    } else {
                        $scope.errorNotify = ErrorService;
                        ErrorService.displayError(msg);
                    }
                });
            };


        }
    ]);

    module.directive('errorNotify', function () {
        return {
            templateUrl: '/partials/notify.html'
        }
    })

}());