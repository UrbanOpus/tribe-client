/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.home', [])

    .controller('HomeCtrl', function($scope, UserService) {
        $scope.data = {};
        $scope.data.message = 'Hello world';
    })
