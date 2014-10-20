angular.module('tribe.tribeinfo', [])
    .controller('TribeInfoCtrl', function($scope, $ionicLoading, $ionicModal, $ionicPopup, $ionicScrollDelegate, APIService, UserService, tribe, uuid, user) {
        APIService.handshake().success(function () {
          $ionicLoading.hide();

          tribe.data.createdAt = moment(tribe.data.createdAt).format('l');

          $scope.usertribe = user.data.tribe;

          $scope.memberOf = _.contains(tribe.data.members, uuid);

          $scope.tribe = tribe.data;

          $scope.joinTribe = function () {
            var toSubmit = {
                uuid: UserService.get('uuid')
            };

            APIService.joinTribe(tribe.data._id,toSubmit).success(function (result) {
                $scope.memberOf = true;
                console.log('success',result);
            }).error(function (err) {
                console.log('error', err);
            });
          };

          $scope.leaveTribe = function () {
            var toSubmit = {
                uuid: UserService.get('uuid')
            };

            if ($scope.usertribe.length > 1) {
              APIService.leaveTribe(tribe.data._id,toSubmit).success(function (result) {
                  $scope.memberOf = false;
                  console.log('success',result);
              }).error(function (err) {
                  console.log('error', err);
              });
            } else {
              $ionicPopup.alert({
                  title: 'Leave Tribe',
                  template: 'You must be in at least one Tribe!!!',
                  okText: 'Close',
                  okType: 'button-assertive'
              })
            }


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

    });
