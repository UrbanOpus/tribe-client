angular.module('tribe.controllers', [])

.controller('MainCtrl', function($scope) {
    $scope.data = {};
    $scope.data.message = 'Hello world';
})

.controller('MoodCtrl', function($scope) {
    $scope.data = {};
    $scope.data.message = 'Hello mood';
})

.controller('QuestionCtrl', function($scope) {
    $scope.data = {};
    $scope.data.message = 'Hello questions';
})
