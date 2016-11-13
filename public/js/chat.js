var app = angular.module('socket.io', []);

app.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:8080');
});

app.controller('Ctrl', function Ctrl($scope, $socket) {
    
    $socket.on('echo', function (data) {
        $scope.serverResponse = data;
    });
    
    $scope.emitBasic = function emitBasic() {
        console.log('echo event emited');
        $socket.emit('echo', $scope.dataToSend);
        $scope.dataToSend = '';
    };
    
    $scope.emitACK = function emitACK() {
        $socket.emit('echo-ack', $scope.dataToSend, function (data) {
            //se nao tivesse sido feito $apply
            //a variavel $scope não seria reconhecida
            $scope.serverResponseACK = data;
        });
        $scope.dataToSend = '';
    };
});