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
                            console.log(n);
                            console.log(o);
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
    module.controller('headerController', [
        '$scope',
        'Auth',
        '$state',
        '$http',
        '$rootScope',
        function ($scope, Auth, $state, $http, $rootScope) {
        }
    ]);
    module.controller('postController', [
            '$scope',
            'postList',
            '$state',
            '$http',
            '$timeout',
            '$rootScope',
            function ($scope, postList, $state, $http, $timeout, $rootScope) {
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
                                            delete $scope.input;
                                        }, 500);
                                } else {
                                    $scope.msg = res.data.msg;
                                    $scope.error = true;
                                    $timeout(function () {
                                        $scope.error = false;
                                        $scope.msg = null;
                                    }, 4000);
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
                $scope.likeOrUnlike = function (id, flag, index) {
                    $scope.index = index;
                    $http.post('/posts/likeOrUnlike', {
                        post_id: id,
                        flag: flag })
                        .then(
                            function (res) {
                                if (res.data.code == 1){
                                    $scope.postList[$scope.index].likes.unshift(
                                        {
                                            user_id: $scope.user.user_id,
                                            nickname: $scope.user.nickname
                                        }
                                    );
                                    $scope.postList[$scope.index].isLiked = true;
                                }else if(res.data.code == 2){
                                    // unlike confirmed
                                    var j;
                                    for(var i = 0; i <= $scope.postList[$scope.index].likes.length; i++){
                                        if($scope.postList[$scope.index].likes[i].user_id == $scope.user.user_id){
                                            j = i;
                                            break;
                                        }
                                    }
                                    $scope.postList[$scope.index].likes.splice(j, 1);
                                    $scope.postList[$scope.index].isLiked = false;
                                }else {
                                    console.log('cannot like or unlike');
                                }
                            }, function (error) {
                                console.log('error in like or unlike ' + error);
                            }
                        )
                }
    
            }
        ]
    );

    module.controller('homeController', [
        '$scope',
        '$rootScope',
        '$state',
        'information',
        '$timeout',
        'Auth',
        '$http',
        function ($scope, $rootScope, $state, information, $timeout, Auth, $http) {
            $scope.teams = information.teams;
            $scope.hasNoTeam = ($scope.teams.length === 0);
            $rootScope.user = information.user;
            $rootScope.isLoggedin = $rootScope.user;
            $scope.openTag = function () {
                for(var i = 0; i < $scope.teams.length ; i++){
                    if($scope.teams[i].id == $rootScope.selectedTeamId){
                        // var element = angular.element(document.querySelector('#team' + i));
                        // $(element.children()[1]).slideToggle();
                        $scope.index = i;
                        $timeout(function () {
                            $scope.tagSlide('teams' + $scope.index);
                        },10);
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
             Log out
             */
            $rootScope.logout = function () {

                $http.post('/users/logout')
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                Auth.removeCookie();
                                $scope.clear();
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
            };
            /*
             Open or close tag
             */
            $scope.tagSlide = function (tagName) {
                var element = angular.element(document.querySelector('#' + tagName));
                if( $(element).hasClass('open')){
                    $(element).removeClass('open');
                }else {
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
                $scope.selectedId = id;
                $scope.selectedName = name;
                $scope.selectedTeamTeammates = teammates;
                $('#' + tag).addClass('is-visible');
            };
            /*
             Close team form
             */
            $scope.closeForm = function (tag, flag) {
                if (flag) {
                    delete $scope.input;
                }
                delete $scope.selectedId;
                delete $scope.selectedName;
                delete $scope.selectedTeamTeammates;
                $('#' + tag).removeClass('is-visible');
            };

            $scope.createTeam = function () {
                console.log('createTeam clicked');
                $http.post('/teams/create', $scope.team)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('create-team');
                                $timeout(
                                    function () {
                                        $scope.$emit('ChangeTeam', $state.$current);
                                        delete $scope.team;
                                    }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    $scope.msg = null;
                                }, 4000);
                            }
                        }, function (error) {
                            console.log('error in create teams ' + error);
                        }
                    )
            };
            $scope.changeID = function(id){
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

    module.controller('teamController', [
        '$http',
        '$scope',
        '$timeout',
        '$state',
        function ($http, $scope, $timeout, $state) {
            $scope.team = {};
            $scope.loadTeamDetail = function () {
                $scope.teamsDetail = [];
                for (var i = 0; i < $scope.teams.length; i++) {
                    $http.get('/teams/team_info?team_id=' + $scope.teams[i].id)
                        .then(
                            function (res) {
                                var detail;
                                if (res.data.code == 1) {
                                    detail = {
                                        name: res.data.name,
                                        team_id: res.data.team_id,
                                        description: res.data.description,
                                        is_creator: res.data.r_u_creator,
                                        teammates: res.data.users
                                    };
                                    $scope.teamsDetail[$scope.teamsDetail.length] = detail;
                                } else {
                                    $scope.teamsDetail[$scope.teamsDetail.length] = {};
                                }
                            }, function (error) {
                                console.log('error in get team info ' + error);
                            }
                        );
                }
            };
            $scope.deleteTeam = function () {
                console.log('delete');
                $http.delete('/teams/delete?team_id=' + $scope.selectedId)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('delete-team');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot delete team');
                            }
                        }, function (error) {
                            console.log('error in delete team ' + error);
                        }
                    )
            };
            $scope.addUser = function () {
                console.log('addUSER');
                $scope.input.team_id = $scope.selectedId;
                $http.post('/teams/add_user', $scope.input)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('add-user');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot add user');
                            }
                        }, function (error) {
                            console.log('error in add user ' + error);
                        }
                    );
            };
            $scope.removeUser = function () {
                console.log('remove user');
                $scope.input.team_id = $scope.selectedId;
                $http.delete('/teams/remove_user?team_id=' + $scope.input.team_id
                    + '&user_id=' + $scope.input.user_id + '&message=' + $scope.input.message)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('remove-user');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot remove user');
                            }
                        }, function (error) {
                            console.log('error in remove user ' + error);
                        }
                    );
            };
            $scope.quitTeam = function () {
                console.log('quit');
                $http.delete('/teams/quit?team_id=' + $scope.selectedId)
                    .then(
                        function (res) {
                            if (res.data.code == 1) {
                                $scope.closeForm('quit-team');
                                $timeout(function () {
                                    $scope.$emit('ChangeTeam', 'home.teams');
                                }, 500);
                            } else {
                                $scope.msg = res.data.msg;
                                $scope.error = true;
                                $timeout(function () {
                                    $scope.error = false;
                                    delete $scope.msg;
                                }, 4000);
                                console.log('cannot quit team');
                            }
                        }, function (error) {
                            console.log('error in quit team ' + error);
                        }
                    )
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
}());