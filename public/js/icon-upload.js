var app = angular.module('iconUpload', ['ngFileUpload', 'ngImgCrop']);

app.controller('MyCtrl', ['$scope', 'Upload', '$timeout', '$http', function ($scope, Upload, $timeout, $http) {

    /* Check whether user already has avatar */
    $http.get('/users/download_avatar')
        .then(
        function (res) {
            if(!res.data.code){ //
                $scope.current_avatar = '/users/download_avatar';
            }else{
                $scope.current_avatar = '/images/default_avatar.jpg';
            }
        }, function (error) {
            console.log('error in get team info ' + error);
        }
    );

    /* Crop */
    $scope.myCroppedImage = '';
    $scope.myImage = '';

    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0];
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
    $scope.upload = function (dataUrl, name) {
        //console.log("upload-> dataUrl: " + dataUrl + " name: " + name);
        Upload.upload({
            url: 'http://localhost:8080/users/upload_avatar',
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