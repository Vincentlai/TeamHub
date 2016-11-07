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
                setAccess: function () {
                    $http.get('/users/my_info')
                        .then(function (res) {
                                if (res.data.code == 1) {
                                    var user = {
                                        'email': res.data.email,
                                        'nickname': res.data.nickname
                                    };
                                    $cookies.putObject('User', user);
                                }
                            }, function (error) {
                                console.log('Error in Auth. ' + error);
                            }
                        );
                    // console.log($cookies.getObject('User'));
                },

                isLoggedIn: function () {
                    var user = $cookies.getObject('User');
                    console.log(user);
                    return user;
                },
                checkCookie: function () {
                    $http.get('/users/my_info')
                        .then(function (res) {
                                if (res.data.code == 1) {
                                    var user = {
                                        'email': res.data.email,
                                        'nickname': res.data.nickname
                                    };
                                    $cookies.putObject('User', user);
                                    return $cookies.getObject('User');
                                }
                            }, function (error) {
                                console.log('Error in Auth. ' + error);
                                return $cookies.getObject('User');
                            }
                        );

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
                            Auth.setAccess();
                            $state.go('home');
                        } else {
                            me.msg = r.data.msg;
                            me.error = true;
                            me.error = false;
                            // $timeout(function () {
                            //     me.error = false;
                            // }, 4000);
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
                            me.error = false;
                            // $timeout(function () {
                            //     me.error = false;
                            // }, 4000);
                        } else {
                            me.msg = r.data.msg;
                            me.error = true;
                            me.error = false;
                            // $timeout(function () {
                            //     me.error = false;
                            // }, 4000);
                        }
                    }, function (e) {
                        console.log(e.data);
                    });
            }
        }
    ]);

})();
