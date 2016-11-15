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

        }
    ]);
    module.service('PostService',[
        '$http',
        '$timeout',
        '$state',
        function($http, $timeout, $state){
            var me = this;
            me.data = {};
            me.CreatePost = function (){
                console.log('CreatePost');
                // $http.post('/users/post', me.data)
                //     .then(function (r) {
                // }



            }
        }
    ]);
})();
