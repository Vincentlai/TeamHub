var app = angular.module('fileUpload', ['ngFileUpload']);

app.filter('sizeFilter', [
    function () {
        return function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }]
);
app.controller('fileController', ['$scope', 'Upload', '$timeout',
    '$http', '$rootScope', '$window', 'FileService', '$stateParams',
    'ErrorService', '$q',
    function ($scope, Upload, $timeout, $http, $rootScope, $window, FileService,
              $stateParams, ErrorService, $q) {

        //initialize
        $rootScope.selectedTeamId = $stateParams.team_id;
        var team_id = $rootScope.selectedTeamId;
        $scope.sortType = 'time';
        $scope.sortReverse = true;
        $scope.searchFile = '';
        $scope.selected_creator = 'All Files';
        $scope.creator_filter = '';
        $scope.file_list = [];
        $scope.errorNotify = ErrorService;
        $scope.selectedFilter = function (flag) {
            if(flag == 1){
                $scope.selected_creator = 'My Files';
                $scope.creator_filter = $rootScope.user.nickname;
            }else{
                $scope.selected_creator = 'All Files';
                $scope.creator_filter = '';
            }
        };

        $scope.show_loading = false;
        var show_uploading = false;


        $scope.showUploading = function () {
            return show_uploading;
        };


        function load_list() {
            $scope.show_loading = true;
            /* Get file list */
            $http.get('/files/all?team_id=' + team_id)
                .then(
                    function (res) {

                        $scope.show_loading = false;

                        if (res.data) {
                            if (res.data.code == '1') {

                                res.data.files.forEach(function (file) {
                                    $scope.file_list.push({
                                        file_id: file.file_id,
                                        owner_user_id: file.owner_user_id,
                                        owner_nickname: file.owner_nickname,
                                        file_name: file.file_name,
                                        file_size: file.file_size,
                                        time: new Date(parseInt(file.file_id.toString().substring(0, 8), 16) * 1000),
                                        is_deleting: false
                                    });
                                });

                            }
                        }
                    }, function (error) {
                    });
        }
        load_list();


        // icon scr
        $scope.getSrc = function (file_name) {

            var file_type = file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length).toLocaleLowerCase();
            return FileService.getFilePic(file_type);

        };

        $scope.viewFile = function (file_id) {
            $window.open('/files/download?file_id=' + file_id);
        };

        $scope.getFilePath = function (file_id) {
            return '/files/download?file_id=' + file_id;
        };

        $scope.showDeleting = function (index) {
            var file = $scope.file_list[index];
            if (file) {
                return file.is_deleting;
            } else {
                return false;
            }
        };
        $scope.deleteFile = function (file) {

            file.is_deleting = true;
            var name = file.file_name;
            file.file_name = 'Deleting.....';
            FileService.deleteFile(file.file_id, function (code, msg) {
                file.file_name = name;
                if (code == 1) {
                    file.is_deleting = false; // remove deleting icon
                    for (var i = 0; i < $scope.file_list.length; i++) {
                        if ($scope.file_list[i].file_id == file.file_id) {
                            $scope.file_list.splice(i, 1);
                        }
                    }
                }
            });

        };

        $scope.files = [];
        $scope.$watch('files', function () {
            if ($scope.files.length > 0) {
                uploadMultipleFiles();
            }
        });

        /* Drag and Drop - Upload Multiple Files */
        var uploadMultipleFiles = function () {
            for (var i = 0; i < $scope.files.length; i++) {
                // file size limit check
                if ($scope.files[i].size > 16000000) {
                    ErrorService.displayError('Size of ' + $scope.files[i] + ' is over 16MB');
                    return;
                }
            }
            var promises = [];
            angular.forEach($scope.files, function (file, index) {
                var deferred = $q.defer();
                file.is_uploading = true;
                Upload.upload({
                    url: '/files/upload',
                    data: {
                        team_id: team_id,
                        file: file,
                        file_name: file.name,
                        file_size: file.size
                    }
                }).then(function (response) {
                    $timeout(function () {

                        var data = response.data;
                        file.is_uploading = false;
                        if (data.code == '1') {
                            file.load_ok = true;
                            deferred.resolve('ok');
                            $scope.file_list.unshift({
                                file_id: data.file_id,
                                owner_user_id: data.owner_user_id,
                                owner_nickname: data.owner_nickname,
                                file_name: data.file_name,
                                file_size: data.file_size,
                                time: new Date(parseInt(data.file_id.toString().substring(0, 8), 16) * 1000),
                                is_deleting: false
                            });

                        } else {
                            file.load_error = true;
                            ErrorService.displayError(data.msg);
                            deferred.reject(data.msg);
                        }
                    });
                }, function (response) {
                    if (response.status > 0) {
                        file.load_error = true;
                        ErrorService.displayError('Upload failed');
                        deferred.reject('Upload failed');
                    }
                }, function (evt) {
                });
                promises.push(deferred.promise);
            });

            $q.all(promises).then(
                function (res) {
                    $timeout(function () {
                        $scope.closeForm('upload-file');
                    }, 1000)
                }, function (error) {
                }
            );


        };

        $scope.sort = function (name) {
            if ($scope.sortType == name) {
                $scope.sortReverse = !$scope.sortReverse;
            } else {
                $scope.sortType = name;
                $scope.sortReverse = false;
            }
        };

        $scope.querySearch = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange = searchTextChange;
        $scope.states = loadAll();

        function querySearch(query) {
            return query ? $scope.states.filter(createFilterFor(query)) : $scope.states;
        }

        function loadAll() {
            return $scope.file_list.map(function (file) {
                if($scope.creator_filter!=''){
                    if($scope.creator_filter == file.owner_nickname){
                        return {
                            value: file.file_name.toLowerCase(),
                            display: file.file_name
                        }
                    }else{

                    }
                }else{
                    return {
                        value: file.file_name.toLowerCase(),
                        display: file.file_name
                    }
                }

            })
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };

        }

        function searchTextChange(text) {
            // console.info('Text changed to ' + text);
        }

        function selectedItemChange(item) {
            // console.info('Item changed to ' + JSON.stringify(item));
            if (angular.isUndefined(item)) {
                $scope.searchFile = '';
            } else {
                $scope.searchFile = item.value;
            }
        }

        $scope.$watch(function () {
            return $scope.file_list.length;
        }, function (n, o) {
            $scope.states = loadAll();
        }, true);

        $scope.$watch(function () {
            return $scope.creator_filter;
        }, function (n, o) {
            $scope.states = loadAll();
        }, true);

        /*
         Close team form
         */
        $scope.closeForm = function (tag) {
            $('#' + tag).removeClass('is-visible');
            $scope.files = [];
            ErrorService.resetError();
        };


    }]);