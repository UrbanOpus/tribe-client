// Created by rayh

angular.module('tribe.settings', ['ionic'])
    .controller('SettingsCtrl', function($scope, APIService, UserService, $ionicPopup) {
        $scope.data = {};

        APIService.handshake().success(function () {
          $scope.data.nickname = UserService.get('nickname');

          var uuid = UserService.get('uuid');

          console.log($scope.nickname);

          $scope.updateSettings = function() {
            APIService.changeNickName(uuid, $scope.data.nickname).success(function () {
              UserService.set('nickname', $scope.data.nickname);
              $ionicPopup.alert({
                  title: 'Success!',
                  template: 'Nickname Saved'
              })
            });
          };

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

        
/*        $scope.updateSettings = function() {
            var onSuccess;
            // if someone cleared the input -- treat it as an implicit
            // disable by setting it to the default
            if ($scope.mood_notify.time === "") {
                $scope.mood_notify.checked = false;
            }
            
            onSuccess = $scope.mood_notify.checked && function () { $localNotificationService.scheduleMood($scope.mood_notify.time); };

            $localNotificationService.cancel(onSuccess);

            $localstorage.setObject('mood_notify', $scope.mood_notify);
        };

        $scope.deleteUser = function () {
            APIService.deleteUser(UserService.get('uuid')).success(function () {
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'User deleted'
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'User does not exist (already deleted?)'
                });
            });
        };*/
    });
