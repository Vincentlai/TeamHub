/**
 * Created by Qiang Lai on 2016/11/18.
 */
;(function () {
    'use strict';
var module = angular.module('file', []);


module.directive('fileInput',['$parse',function($parse){
    return{
        restrict:'A',
        link:function(scope,elm,attrs){
            elm.bind('change',function(){
                    $parse(attrs.fileInput)
                        .assign(scope,elm[0].files);
                    scope.$apply();
                }
            )
        }
    }
}]);
module.controller("upload", ['$scope', '$http',
    function($scope,$http){
        $scope.filesChanged =function(elm){
            $scope.files=elm.files;
            $scope.$apply();
        };
        $scope.message = "test";
        $scope.upload = function(){
            var fd = new FormData();
            angular.forEach($scope.files,function(file){
                fd.append('file',file)
            });
            $http.post('upload.ashx',$scope.files,
                {
                    transformRequest:angular.identity,
                    headers:{'Content-Type':'multipart/form-data'}
                }
            )
                .success(function(d){
                    console.log(d)
                })
        }
    }]);

}());