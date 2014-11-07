angular.module('tribe.tribeMessages', ['angularMoment'])
    .controller('TribeMessageCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, $stateParams, $firebase, APIService, UserService) {
        APIService.handshake().success(function () {
          var MESSAGELIMIT = 1000;
          $ionicLoading.hide();

          $scope.nickname = UserService.get('nickname');

          $scope.userid = UserService.get('uuid');

          $scope.tribe = $stateParams.id;

          if ($stateParams.id === "global") {
            $scope.globalchat = true;
          }

          $scope.message = {
            name: $scope.nickname,
            content: "",
            uuid: ""
          }

          var ref = new Firebase("https://glaring-torch-9281.firebaseio.com/" + $scope.tribe);

          $scope.messages = $firebase(ref.limit(MESSAGELIMIT));

           $scope.addMessage = function(e) {
              $scope.sendMsg = function() {
                $scope.messages.$add({from: $scope.message.name, body: $scope.message.content, uuid: $scope.userid});
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
