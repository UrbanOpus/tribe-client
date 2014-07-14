angular.module('tribe.welcome', [])


    .controller('WelcomeCtrl', function ($scope, UserService) {
        $scope.data = {};
        $scope.data.message = 'Welcome!';

        $scope.data.regid = UserService.get('registrationID');
    });