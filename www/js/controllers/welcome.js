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
            // we have to create the user so that the welcome dialog does not popup every time the app starts up
            var submission = {
                uuid: UserService.get('uuid')
            };

            APIService.createUser(submission).success(function (user) {
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'User created'
                }).then(function () {
                    $location.path('/app/home');
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: error
                });
            });

            $location.path('/app/home');
        }
    });