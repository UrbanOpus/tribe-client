angular.module('tribe.tribeinfo', [])
    .controller('TribeInfoCtrl', function($scope, $ionicLoading, $ionicModal, $ionicScrollDelegate, APIService, tribe) {
        APIService.handshake().success(function () {
          $ionicLoading.hide();

          $scope.tribe = tribe.data;
        }).error(function () {
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: 'Connection error',
                template: 'Server could not be reached.  Please check your internet connection.',
                okText: 'Close App',
                okType: 'button-assertive'
            }).then(function (res) {
                navigator.app.exitApp();
            });
        });

    });
