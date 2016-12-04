/**
 * Created by Qiang Lai on 2016/11/6.
 */
(function () {
    var module = angular.module('Services', []);

    module.factory('Auth', [
        '$http',
        '$cookies',
        function ($http, $cookies) {
            return {
                setCookie: function (s) {
                    $cookies.put('Access', s);
                },
                isLoggedIn: function () {
                    return $cookies.get('Access');
                },
                removeCookie: function () {
                    $cookies.remove('Access');
                }
            }
        }
    ]);

    module.service('UserService', [
        '$http',
        '$timeout',
        'Auth',
        '$state',
        'CallApi',
        function ($http, $timeout, Auth, $state, CallApi) {
            var me = this;
            me.data = {};
            me.login = function () {
                console.log('login');
                $http.post('/users/login', me.data)
                    .then(function (r) {
                        if (r.data.code == 1) {
                            Auth.setCookie(r.data.session_id);
                            $state.go('home.overview');
                        } else {
                            me.msg = r.data.msg;
                            me.error = true;
                            $timeout(function () {
                                me.error = false;
                            }, 4000);
                        }
                    }, function (e) {
                        console.log(e.data);
                    });
            };
            me.signup = function () {
                console.log('signup');
                $http.post('/users/register', me.data)
                    .then(function (r) {
                        if (r.data.code == 1) {
                            me.msg = r.data.msg;
                            me.error = true;
                            $timeout(function () {
                                me.error = false;
                                me.data = '';
                                $state.go('login');
                            }, 4000);
                        } else {
                            me.msg = r.data.msg;
                            me.error = true;
                            $timeout(function () {
                                me.error = false;
                            }, 4000);
                        }
                    }, function (e) {
                        console.log(e.data);
                    });
            };
            me.logout = function (callback) {
                var url = '/users/logout';
                $http.post(url)
                    .then(
                        function (res) {
                            Auth.removeCookie();
                            callback();
                        }, function (error) {
                            console.log('Error occurs in Logout' + error);
                        }
                    )
            };
            me.changePassword = function (data, callback) {
                var url = '/users/cpass';
                CallApi.postApi(url, data, function (code, msg) {
                    callback(code, msg);
                });

            };

            me.getAvatar = function (id, callback) {
                var url = '/users/download_avatar?user_id=' + id;
            }

        }
    ]);

    module.factory('CallApi', [
        '$http',
        function ($http) {
            var CallApi = {};

            var successFun = function (code, msg, callback) {
                if (code == 1) {
                    callback(1);
                } else {
                    callback(code, msg);
                }
            };

            var getApiSuccessFun = function (data, callback) {
                if (data.code == 1) {
                    callback(1, data);
                } else {
                    callback(0, data.msg);
                }
            };

            CallApi.getApi = function (url, callback) {
                $http.get(url)
                    .then(
                        function (res) {
                            getApiSuccessFun(res.data, function (code, data) {
                                callback(code, data)
                            })
                        }, function (error) {
                            console.log('error in ' + url + " " + error);
                        }
                    )
            };

            CallApi.postApi = function (url, data, callback) {
                $http.post(url, data)
                    .then(
                        function (res) {
                            successFun(res.data.code, res.data.msg, function (code, msg) {
                                callback(code, msg)
                            })
                        }, function (error) {
                            console.log('error in ' + url + " " + error);
                        }
                    )
            };

            CallApi.deleteApi = function (url, callback) {
                $http.delete(url)
                    .then(
                        function (res) {
                            successFun(res.data.code, res.data.msg, function (code, msg) {
                                callback(code, msg)
                            })
                        }, function (error) {
                            console.log('error in ' + url + " " + error);
                        }
                    )
            };

            return CallApi;
        }
    ]);

    module.service('ErrorService', [
        '$timeout',
        function ($timeout) {
            var me = this;
            me.displayError = function (msg) {
                me.msg = msg;
                me.error = true;
                $timeout(function () {
                    me.error = false;
                    me.msg = null;
                }, 4000);
            };
            me.resetError = function () {
                me.error = false;
                me.msg = null;
            };
        }
    ]);

    module.service('TeamService', [
        'CallApi',
        function (CallApi) {
            var me = this;

            me.teamsDetail = function (data, callback) {
                var url = '/teams/team_info?team_id=' + data;

                CallApi.getApi(url, function (code, data) {
                    if (code) {
                        var detail;
                        detail = {
                            name: data.name,
                            team_id: data.team_id,
                            description: data.description,
                            is_creator: data.r_u_creator,
                            teammates: data.users
                        };
                        callback(code, detail);
                    } else {
                        callback(code, data.msg);
                    }
                })
            };

            me.createTeam = function (data, callback) {
                var url = '/teams/create';
                CallApi.postApi(url, data, function (code, msg) {
                    callback(code, msg);
                });
            };

            me.addUser = function (data, callback) {
                var url = '/teams/add_user';
                CallApi.postApi(url, data, function (code, msg) {
                    callback(code, msg);
                })
            };

            me.deleteTeam = function (data, callback) {
                var url = '/teams/delete?team_id=' + data;

                CallApi.deleteApi(url, function (code, msg) {
                    callback(code, msg);
                });
            };

            me.removeUser = function (data, callback) {
                var url = '/teams/remove_user?team_id=' + data.team_id
                    + '&user_id=' + data.user_id + '&message=' + data.message;

                CallApi.deleteApi(url, function (code, msg) {
                    callback(code, msg);
                });
            };

            me.quitTeam = function (data, callback) {
                var url = '/teams/quit?team_id=' + data;

                CallApi.deleteApi(url, function (code, msg) {
                    callback(code, msg);
                });
            };


        }
    ]);

    module.service('PostService', [
        'CallApi',
        function (CallApi) {
            var me = this;
            me.getComments = function (id, callback) {
                var url = '/posts/get_comments?post_id=' + id;
                CallApi.getApi(url, function (code, data) {
                    if (code == 1) {
                        var commentArray = [];
                        data.comments.forEach(function (comment) {
                            commentArray.push(
                                {
                                    user_id: comment.user_id,
                                    nickname: comment.nickname,
                                    comment: comment.comment,
                                    comment_id: comment._id.toString(),
                                    time: new Date(parseInt(comment._id.toString().substring(0, 8), 16) * 1000)
                                }
                            );
                        });
                        callback(commentArray);
                    } else {
                        console.log(data.msg);
                    }
                });
            };
            me.deleteComment = function (post_id, comment_id, callback) {
                var url = 'posts/deleteComment?post_id=' + post_id + '&comment_id=' + comment_id;
                CallApi.deleteApi(url, function (code, data) {
                    if (code == 1) {
                        callback();
                    } else {
                        console.log(data.msg);
                    }
                })
            }
        }
    ]);

    module.service('FileService', [
        'CallApi',
        'Upload',
        function (CallApi, Upload) {
            var me = this;
            me.getSize = function (bytes) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes == 0) return '0 Byte';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
            };

            me.getFilePic = function (file_type) {
                var path = '/images/file/';

                if (file_type == 'jpg' || file_type == 'jpeg' || file_type == 'png' || file_type == 'gif') {
                    return path + 'image.png';

                } else if (file_type == 'pdf') {
                    return path + 'pdf.png';

                } else if (file_type == 'doc' || file_type == 'docx') {
                    return path + 'word.png';

                } else if (file_type == 'xls' || file_type == 'xlsx') {
                    return path + 'xls.png';

                } else if (file_type == 'ppt' || file_type == 'pptx') {
                    return path + 'ppt.png';

                } else if (file_type == 'zip' || file_type == 'rar') {
                    return path + 'zip.png';

                } else if (file_type == 'mp3' || file_type == 'wma' || file_type == 'wav') {
                    return path + 'music.png';

                } else if (file_type == 'mp4' || file_type == 'wmv' || file_type == 'mpg' || file_type == 'mpeg' || file_type == 'flv' || file_type == 'rmvb') {
                    return path + 'video.png';
                } else {
                    return path + 'other.png';
                }
            };

            me.deleteFile = function (id, callback) {
                var url = '/files/delete?file_id=' + id;

                CallApi.deleteApi(url, function (code, msg) {
                    callback(code, msg);
                })
            };
            var generateResult = function (data) {
                return {
                    file_id: data.file_id,
                    owner_user_id: data.owner_user_id,
                    owner_nickname: data.owner_nickname,
                    file_name: data.file_name,
                    file_size: bytesToSize(data.file_size),
                    time: data.time,
                    is_deleting: false
                }
            };

            var generateResult2 = function (data) {
                return {
                    file_id: data.file_id,
                    file_name: data.file_name
                }
            };

            me.uploadFile = function (data, callback) {
                Upload.upload({
                    url: url,
                    data: data
                }).then(function (res) {
                    if (res.data.code == 1) {
                        callback(res.data.code);
                    } else {
                        callback(res.data.code, res.data.msg);
                    }
                }, function (error) {
                    callback(error.status, 'Upload Failed');
                })
            };
        }
    ]);

    module.service('NewsService', [
        '$q',
        '$http',
        function ($q, $http) {
            var me = this;
            var addNewsToArray = function (news, team_id) {
                var list = [];
                var item;
                for (var j = 0; j < news.length; j++) {
                    item = {
                        user_id: news[j].user_id,
                        user_nickname: news[j].user_nickname,
                        action_name: news[j].action_name,
                        action_target: news[j].action_target,
                        action_target_id: news[j].action_target_id,
                        time_in_mili: new Date(parseInt(news[j]._id.toString().substring(0, 8), 16) * 1000),
                        target_team: news[j].target_team_name,
                        target_team_id: team_id
                    };
                    list.unshift(item);
                }
                return list;
            };
            me.getNews = function (teams) {
                var news_list = [];
                return $q.all(teams.map(function (team) {
                    return $http.get('/teams/news?team_id=' + team.id);
                }))
                    .then(
                        function (result) {
                            angular.forEach(result, function (res) {
                                if (res.data.code == 1) {
                                    news_list = news_list.concat(addNewsToArray(res.data.news, res.data.team_id));
                                } else {
                                    console.log(res.data.msg);
                                }
                            });
                            return news_list;
                        }, function (error) {
                            console.log(error);
                        }
                    )
            };

        }
    ]);
    module.service('EventService', [
        '$q',
        '$http',
        function ($q, $http) {
            var me = this;
            var addEventToArray = function (events, team_name) {
                var list = [];
                var item;
                for (var j = 0; j < events.length; j++) {
                    item = {
                        start: Date.parse(events[j].start),
                        end: Date.parse(events[j].end),
                        title: events[j].title,
                        event_id: events[j]._id,
                        description: events[j].description,
                        creator_id: events[j].creator_id,
                        creator_nickname: events[j].creator_nickname,
                        team_name: team_name,
                        team_id: events[j].team_id
                    };
                    list.unshift(item);
                }
                return list;
            };
            me.getEvents = function (teams) {
                var event_list = [];
                var current_time = Date.now();
                return $q.all(teams.map(function (team) {
                    return $http.get('/events/get?team_id=' + team.id + '&current_time=' + current_time);
                }))
                    .then(
                        function (result) {
                            angular.forEach(result, function (res) {
                                if (res.data.code == 1) {
                                    event_list = event_list.concat(addEventToArray(res.data.events, res.data.team_name));
                                } else if (res.data.code == -3) {
                                } else {
                                    console.log('error in get events');
                                }
                            });
                            return event_list;
                        }, function (error) {
                            console.log(error);
                        }
                    )
            };

        }
    ]);

})();
