var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('FileCtrl', ['$scope', 'Upload', '$timeout', '$http', '$rootScope', '$window',
    function($scope, Upload, $timeout, $http, $rootScope, $window) {

        // Bytes conversion
        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };

        var team_id = $rootScope.selectedTeamId;
        var file_name = '';
        var file_size = 0;
        var dataUrl = '';
        var show_loading = true;
        var show_uploading = false;

        $scope.showLoading = function() {
            return show_loading;
        }

        $scope.showUploading = function() {
            return show_uploading;
        }

        $scope.showDeleting = function(index) {
            var file = $scope.file_list[index];
            if(file){
                return file.is_deleting;
            }else{
                return false;
            }
        }

        function load_list() {
            console.log("load_list");

            /* Get file list */
            $http.get('/files/all?team_id=' + team_id)
                .then(
                function(res) {

                    show_loading = false;

                    if (res.data) {
                        if (res.data.code == '1') {
                            console.log("Got list");
                            $scope.file_list = [];
                            res.data.files.forEach(function(file) {
                                $scope.file_list.push({
                                    file_id: file.file_id,
                                    owner_user_id: file.owner_user_id,
                                    owner_nickname: file.owner_nickname,
                                    file_name: file.file_name,
                                    file_size: bytesToSize(file.file_size),
                                    time: file.time,
                                    is_deleting: false
                                });
                            });
                        }
                    }
                }, function(error) {
                    console.log('error in get team info ' + error);
                });
        }

        // load file list
        load_list();

        // icon scr
        $scope.getSrc = function(index) {

            const path = '/images/file/';

            var file_name = $scope.file_list[index].file_name;
            var file_type = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length).toLocaleLowerCase();

            if (file_type == 'jpg' || file_type == 'jpeg' || file_type == 'png' || file_type == 'gif') {
                return path + 'image.png';

            } else if (file_type == 'pdf') {
                return path + 'pdf.png';

            } else if (file_type == 'doc' || file_type == 'docx') {
                return path + 'word.png';

            } else if (file_type == 'xls' || file_type == 'xlsx') {
                return path + 'xls.png';

            } else if (file_type == 'ppt' || file_type == 'pptx') {
                return path + 'ppt.png';

            } else if (file_type == 'zip' || file_type == 'rar') {
                return path + 'zip.png';

            } else if (file_type == 'mp3' || file_type == 'wma' || file_type == 'wav') {
                return path + 'music.png';

            } else if (file_type == 'mp4' || file_type == 'wmv' || file_type == 'mpg' || file_type == 'mpeg' || file_type == 'flv' || file_type == 'rmvb') {
                return path + 'video.png';
            } else {
                return path + 'other.png';
            }
        }

        $scope.viewFile = function(index) {
            $window.open('/files/download?file_id=' + $scope.file_list[index].file_id);
        }

        $scope.getFileName = function(index) {
            return $scope.file_list[index].file_name;
        }

        $scope.getFilePath = function(index) {
            return '/files/download?file_id=' + $scope.file_list[index].file_id;
        }

        $scope.showDelete = function(index) {
            return $rootScope.user.user_id == $scope.file_list[index].owner_user_id;
        }

        $scope.deleteFile = function(index) {

            $scope.file_list[index].is_deleting = true;

            $http.delete('/files/delete?file_id=' + $scope.file_list[index].file_id)
                .then(
                function(res) {
                    if (res.data) {
                        if (res.data.code == '1') {
                            console.log("File deleted");

                            // remove file from list
                            $scope.file_list[index].is_deleting = false; // remove deleting icon
                            for (var i=0; i<$scope.file_list.length; i++) {
                                if ($scope.file_list[i].file_id == $scope.file_list[index].file_id) {
                                    $scope.file_list.splice(i, 1);
                                }
                            }

                        }
                    }
                }, function(error) {
                    console.log('error in get team info ' + error);
                });
        }

        var handleFileSelect = function(evt) {
            var file = evt.currentTarget.files[0];
            file_name = file.name; console.log('name: ' + file.name);
            file_size = file.size; console.log('size: ' + file.size + ' Bytes');

            // reset progress bar & message
            $scope.progress = 0;
            $scope.result = false;
            $scope.errorMsg = false;

            var reader = new FileReader();
            reader.onload = function(evt) {
                $scope.$apply(function($scope) {
                    dataUrl = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

        /* Upload */
        $scope.upload = function() {
            //console.log("upload-> dataUrl: " + dataUrl + " name: " + file_name);

            // file size limit check
            if (file_size > 16000000) {
                $window.alert("Maximum file size allow is 16 MB");
                return;
            }

            $scope.result = false;
            $scope.errorMsg = false;
            show_uploading = true;

            Upload.upload({
                url: '/files/upload',
                data: {
                    team_id: team_id,
                    file: Upload.dataUrltoBlob(dataUrl, file_name),
                    file_name: file_name,
                    file_size: file_size
                },
            }).then(function(response) {
                $timeout(function() {

                    show_uploading = false;
                    var data = response.data;

                    if (data.code == '1') {

                        $scope.result = true;

                        $scope.file_list.push({
                            file_id: data.file_id,
                            owner_user_id: data.owner_user_id,
                            owner_nickname: data.owner_nickname,
                            file_name: data.file_name,
                            file_size: bytesToSize(data.file_size),
                            time: data.time,
                            is_deleting: false
                        });
                    }else{
                        $scope.errorMsg = true;
                        $scope.upload_error = data.msg;
                    }
                });
                console.log(response.data);
            }, function(response) {
                if (response.status > 0) {
                    $scope.errorMsg = true;
                    $scope.upload_error = "Upload Failed";
                }
                

            }, function(evt) {

            });
        }


    }]);