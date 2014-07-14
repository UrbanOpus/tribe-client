/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.questions', [])

    .filter('toDate', function () {
        return function (val) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            if (val) {
                return months[val.month] + ' ' + val.day + ', ' + val.year;
            }
            return '';
        }
    })

    .filter('answered', function () {
        return function (val) {
            return (val) ? '(answered)' : '';
        }
    })

    .controller('QuestionCtrl', function($scope, $ionicLoading, APIService, UserService) {
        var uuid = UserService.get('uuid'),
            setAnswered;
        $scope.data = {};

        $scope.data.question = {};
        $scope.data.response = {
            value: []
        };

        setAnswered = function(response) {
            $scope.data.question.isAnswered = true;
            $scope.data.response = response;
        };

        APIService.getQuestion().success(function (result) {
            var i, l;
            console.log('question', result);
            $scope.data.question = result;
            $scope.data.question.isAnswered = false;
            l = $scope.data.question.responses.length;

            //determine if answered, and toggle

            for (i = 0; i < l; i += 1) {
                console.log($scope.data.question.responses[i]);
                if ($scope.data.question.responses[i].userID === uuid) {
                    console.log('already answered', $scope.data.question.responses[i]);
                    $scope.data.question.isAnswered = true;
                    $scope.data.response = $scope.data.question.responses[i];
                }
            }

            console.log($scope.data.question);
        }).error(function (error) {
            console.log(error);
        });

        // location


        $scope.data.location = {
            status: 'Use location',
            enabled: false,
            unavailable: false,
            coords: null
        };

        $scope.setLocation = function () {
            console.log('setting location');
            if ($scope.data.location.enabled) {
                if ('geolocation' in navigator) {
                    $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Getting location', duration: 5000});
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        $ionicLoading.hide();
                        $scope.data.location.coords = pos.coords;
                    }, function () {
                        $ionicLoading.hide();
                        $scope.data.location.status = 'Location is unavailable';
                        $scope.data.location.enabled = false;
                        $scope.data.location.unavailable = true;
                    });
                } else {
                    $scope.data.location.status = 'Location is unavailable';
                    $scope.data.location.enabled = false;
                    $scope.data.location.unavailable = true;
                }
            } else {
                console.log('just kidding');
                $scope.data.location.coords = null;
            }
        };


        $scope.submitResponse = function () {
            $ionicLoading.show({
                template:'<i class="icon ion-loading-c"></i><br />Getting location'
            });
            var submission = {
                userID: uuid,
                value: $scope.data.response.value,
                location: $scope.data.location.coords
            };


            APIService.postQuestion($scope.data.question._id, submission).success(function (result) {
                console.log(result);
                $ionicLoading.show({template: '<i class="icon ion-checkmark"></i><br />Success!', duration:'500'})
                setAnswered(submission);
            }).error(function (error) {
                $ionicLoading.show({template: '<i class="icon ion-alert"></i><br />Error: Something went wrong', duration:'1000'})
                console.log(error);
            });
        };
    });