var app = angular.module('iconUpload', ['ngFileUpload', 'ngImgCrop']);

app.controller('settingController', ['$scope', 'Upload', '$timeout', '$http', '$rootScope',
    function ($scope, Upload, $timeout, $http, $rootScope) {
        $scope.initeFun = function () {
            $scope.openTab = false;
        };
        /* Default */
        $scope.current_avatar = '/users/download_avatar?user_id=' + $rootScope.user.user_id;

        /* Crop */
        $scope.myCroppedImage = '';
        $scope.myImage = '';

        var handleFileSelect = function (evt) {
            $scope.createForm('change-avatar');
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        var test = function () {
            $scope.createForm('change-avatar')
        };
        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

        /* Upload */
        $scope.upload = function (dataUrl, name) {
            //console.log("upload-> dataUrl: " + dataUrl + " name: " + name);
            Upload.upload({
                url: '/users/upload_avatar',
                data: {
                    file: Upload.dataUrltoBlob(dataUrl, name)
                },
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