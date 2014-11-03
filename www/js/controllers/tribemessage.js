angular.module('tribe.tribeMessages', [])
    .controller('TribeMessageCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, $stateParams, $firebase, APIService, UserService) {
        APIService.handshake().success(function () {
          $ionicLoading.hide();

          $scope.tribe = $stateParams.id;

          if ($stateParams.id === "global") {
            $scope.globalchat === true;
          }

          $scope.message = {
            name: "",
            content: ""
          }

          var ref = new Firebase("https://glaring-torch-9281.firebaseio.com/" + $scope.tribe);

          $scope.messages = $firebase(ref);

           $scope.addMessage = function(e) {
              $scope.sendMsg = function() {
                $scope.messages.$add({from: $scope.message.name, body: $scope.message.content});
                $scope.message.name = "";
                $scope.message.content = "";
              }
           }

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
