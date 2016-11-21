var app = angular.module('iconUpload', ['ngFileUpload', 'ngImgCrop']);

app.controller('MyCtrl', ['$scope', 'Upload', '$timeout', '$http', '$rootScope', '$window',
 function ($scope, Upload, $timeout, $http, $rootScope, $window) {

    /* Default */
    $scope.current_avatar = '/users/download_avatar?user_id=' + $rootScope.user.user_id;

    var file_name = '';

    /* Crop */
    $scope.myCroppedImage = '';
    $scope.myImage = '';

    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0]; 
        file_name = file.name; console.log(file.name); console.log(file.size);
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
        if(file_type != '.jpg' && file_type != '.jpeg' && file_type != '.png' && file_type && '.gif'){
            $window.alert("Unacceptable file format, please choose an image file.");
            return;
        }

        Upload.upload({
            url: '/users/upload_avatar',
            data: {
                file: Upload.dataUrltoBlob(dataUrl, file_name),
                file_name: file_name
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