var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('FileCtrl', ['$scope', 'Upload', '$timeout', '$http', '$rootScope', '$window',
 function ($scope, Upload, $timeout, $http, $rootScope, $window) {

    var team_id = $rootScope.selectedTeamId;
    var file_name = '';
    var file_size = 0;
    var dataUrl = '';

    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0]; 
        file_name = file.name; console.log('name: ' + file.name); 
        file_size = file.size; console.log('size: ' + file.size + ' Bytes');
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                dataUrl = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

    /* Upload */
    $scope.upload = function () {
        //console.log("upload-> dataUrl: " + dataUrl + " name: " + file_name);

        Upload.upload({
            url: '/files/upload',
            data: {
                team_id: team_id,
                file: Upload.dataUrltoBlob(dataUrl, file_name),
                file_name: file_name,
                file_size: file_size
            },
        }).then(function (response) {
            $timeout(function () {
                $scope.result = response.data;
            });
        }, function (response) {
            if (response.status > 0) $scope.errorMsg = response.status
                + ': ' + response.data;
            console.log(response.data);
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);

        });
    }

}]);