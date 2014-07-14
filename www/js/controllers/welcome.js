angular.module('tribe.welcome', [])


    .controller('WelcomeCtrl', function ($scope, $ionicPopup, $location, UserService, APIService) {
        $scope.data = {};

        $scope.data.time = '12:00';

        $scope.notifyUser = function () {
            var submission = {
                uuid: UserService.get('uuid'),
                notificationTime: $scope.data.time,
                registrationID: UserService.get('registrationID')
            };

            APIService.createUser(submission).success(function (user) {
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'We\'ll notify you at ' + user.notificationTime + '!'
                }).then(function () {
                    $location.path('/app/home');
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: error
                });
            });
        }

        $scope.dontNotifyUser = function () {
            $location.path('/app/home');
        }
    });