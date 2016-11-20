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
                    $cookies.put('Access',s);
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
        function ($http, $timeout, Auth, $state) {
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
            }

        }
    ]);

    module.factory('HomeService',[
        function () {
            var HomeService = {};
            HomeService.test = function (a, b, callback) {

                var s = a;
                var c = b;
                a = 5;
                callback(s + c);
            };

            return HomeService;
        }
    ]);

    module.factory('CallApi',[
        '$http',
        function ($http) {
            var CallApi = {};

            var successFun = function (code, msg, callback) {
                if (code == 1) {
                    callback(1);
                } else {
                    callback(0, msg);
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
        }
    ]);

    module.service('TeamService', [
        '$http',
        'CallApi',
        function ($http, CallApi) {
            var me = this;

            me.teamsDetail = function (data, callback) {
                var url = '/teams/team_info?team_id=' + data;

                CallApi.getApi(url, function (code, data) {
                    var detail;
                    detail = {
                        name: data.name,
                        team_id: data.team_id,
                        description: data.description,
                        is_creator: data.r_u_creator,
                        teammates: data.users
                    };
                    if(code){
                        callback(code, detail);
                    }else {
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


})();
