var app = angular.module('iconUpload', ['ngFileUpload', 'ngImgCrop']);

app.controller('MyCtrl', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {

    $scope.upload = function (dataUrl, name) {
        console.log("upload-> dataUrl: " + dataUrl + " name: " + name);
        Upload.upload({
            url: 'http://localhost:8080/users/upload_avatar',
            data: {
                file: Upload.dataUrltoBlob(dataUrl, name)
            },
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status 
                + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    }

}]);