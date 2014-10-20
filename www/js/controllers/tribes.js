angular.module('tribe.tribes', [])
    .controller('TribeCtrl', function($scope, $ionicLoading, $ionicModal, $ionicScrollDelegate, $location, $timeout, APIService, UserService, asPercentageFilter) {


        APIService.handshake().success(function () {
            var uuid = UserService.get('uuid');

            $scope.data = {};

            var getTribes = function () {
                APIService.getTribes(uuid).success(function (result) {
                    $scope.data.tribes = result;
                }).error(function (error) {
                    console.log(error);
                });
            };
            getTribes();

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
