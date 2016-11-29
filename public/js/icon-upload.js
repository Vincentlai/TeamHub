var app = angular.module('iconUpload', ['ngFileUpload', 'ngImgCrop']);

app.controller('settingController', ['$scope',
    'Upload', '$timeout', '$http', '$rootScope', 'UserService', 'ErrorService',
    function ($scope, Upload, $timeout, $http, $rootScope, UserService, ErrorService) {
        $scope.initeFun = function () {
            $scope.openTab = false;
        };
        /* Default */
        // $scope.current_avatar = '/users/download_avatar?user_id=' + $rootScope.user.user_id;

        /* Crop */
        $scope.myCroppedImage = '';
        $scope.myImage = '';
        var file_name = '';

        var reset = function () {
            $scope.changePasswordForm.$setPristine();
            $scope.changePasswordForm.$setUntouched();
            $scope.currentPassword = '';
            $scope.newPassword = '';
            $scope.newConfirmPassword = '';
        };

        $scope.changePassword = function () {
            console.log('change pwd');
            UserService.changePassword({
                old_pwd: $scope.currentPassword,
                new_pwd: $scope.newPassword
            }, function (code, msg) {
                if (code == 1) {
                    // reset();
                    $scope.errorNotify = ErrorService;
                    ErrorService.displayError('Changed password successfully');
                } else if (code == -2) {
                    $scope.errorNotify = ErrorService;
                    ErrorService.displayError(msg);
                    $scope.pwdIsNotRight = true;
                    $timeout(function () {
                        $scope.pwdIsNotRight = false;
                    }, 4000);
                } else {
                    $scope.errorNotify = ErrorService;
                    ErrorService.displayError(msg);
                }
            })

        };

        var handleFileSelect = function (evt) {
            $scope.createForm('change-avatar');
            var file = evt.currentTarget.files[0];
            file_name = file.name;
            console.log(file.name);
            console.log(file.size);
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

        /* Upload */
        $scope.upload = function (dataUrl) {
            //console.log("upload-> dataUrl: " + dataUrl + " name: " + file_name);

            // file format validation
            var file_type = file_name.substring(file_name.lastIndexOf('.'), file_name.length).toLocaleLowerCase();
            if (file_type != '.jpg' && file_type != '.jpeg' && file_type != '.png' && file_type && '.gif') {
                $window.alert("Unacceptable file format, please choose an image file.");
                return;
            }

            Upload.upload({
                url: '/users/upload_avatar',
                data: {
                    file: Upload.dataUrltoBlob(dataUrl, file_name),
                    file_name: file_name
                }
            }).then(function (response) {
                $timeout(function () {
                    $scope.result = response.data;

                    // update current avatar when finish
                    var ran = Math.random();
                    $scope.current_avatar = '/users/download_avatar?n=' + ran;
                });
            }, function (response) {
                if (response.status > 0) $scope.errorMsg = response.status
                    + ': ' + response.data;
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);

            });
        }

    }]);