/** jshint global angular **/

/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.questions', [])

    .filter('toDate', function () {
        return function (val) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            if (val) {
                return months[val.getMonth()] + ' ' + val.getDate() + ', ' + val.getFullYear();
            }
            return '';
        }
    })

    .filter('answered', function () {
        return function (val) {
            return (val) ? '(answered)' : '';
        }
    })

    .directive('responseBar', function () {
        function link(scope, element, attrs) {

        }
        return {
            link: link,
            restrict: 'A'
        }
    })

    .controller('QuestionCtrl', function($scope, $ionicLoading, $stateParams, $location,
                                         APIService, uuid, qotd) {

        // TODO: remove this, won't be loading until this anyhow
        $ionicLoading.hide();

        var today = new Date();
        var setAnswered = function(response) {
            $scope.data.question.isAnswered = true;
            $scope.data.response = response;
            fetchResponses($scope.data.question._id);
        };
        
        $scope.data = {
            question: {},
            response: {
                value: []
            },
            responses: [],
            isLatestDay: false,
            qDate: new Date(),
            location: {
                status: 'Use location',
                enabled: false,
                unavailable: false,
                coords: null
            }
        };

        // TODO: rename this to piechart 
        $scope.qotd = {
            title: "",
            config: {
            },
            options: {
                chart: {
                    type: 'pieChart',
                    height: 250,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: true,
                    showLegend: false,
                    transitionDuration: 500,
                    labelThreshold: 0.01,
                    legend: {
                        margin: {
                            top: 5,
                            right: 0,
                            bottom: 0,
                            left: 0
                        }
                    }
                }
            },
            data: [],
            events: {
                qotdChart: function (e, scope) {
                    scope.api.refresh();
                }
            }
        };


        
        if ($stateParams.date) {
            $scope.data.qDate = new Date(parseInt($stateParams.date));
            //set 'today' to the currently active day
        }


        console.log('qDate', $scope.data.qDate);

        var yesterday = new Date($scope.data.qDate.getTime() - 1000*60*60*24),
            tomorrow  = new Date($scope.data.qDate.getTime() + 1000*60*60*24);

        if ($scope.data.qDate.getMonth() === today.getMonth() &&
            $scope.data.qDate.getDate()   === today.getDate() &&
            $scope.data.qDate.getFullYear()  === today.getFullYear()) {
            $scope.data.isLatestDay = true;
        }


        $scope.goBack = function () {
            $location.url('/app/qotd?date=' + yesterday.getTime());
        };
        $scope.goForward = function () {
            $location.url('/app/qotd?date=' + tomorrow.getTime());
        };

//        APIService.getQuestion($scope.data.qDate).success(function (result) {
        // TODO: remove this IIFE, not sure whether we need to isolate
        //the variables i,l
        (function(result) {
            var i, l;
            console.log('question', result);
            $scope.data.question = result;
            $scope.data.question.isAnswered = false;
            
            if ($scope.data.question) {
                l = $scope.data.question.responses.length;
                
                //determine if answered, and toggle
                
                for (i = 0; i < l; i += 1) {
                    console.log($scope.data.question.responses[i]);
                    if ($scope.data.question.responses[i].userID === uuid) {
                        console.log('already answered', $scope.data.question.responses[i]);
                        $scope.data.question.isAnswered = true;
                        
                        $scope.data.response = $scope.data.question.responses[i];
                        $scope.data.location.enabled = !(!$scope.data.response.location);
                        
                        // since we've answered it already, load the responses
                        (function(result) {
                            $scope.data.responses = result;
                            
                            // don't double add after a submission
                            
                            var r, total = 0, most;
                            for (r in result) {
                                if (result.hasOwnProperty(r)) {
                                    if (most === undefined || result[most].length < result[r].length) {
                                        most = r;
                                    }
                                    total += result[r].length;
                                    
                                    
                                    $scope.qotd.data.push({
                                        key: r,
                                        y: result[r].length
                                    });
                                }
                            }
                            $scope.data.totalResponses = total;
                            $scope.data.mostResponses = most;
                            
                        })(result.responses);
                        
                        break;
                    }
                }
            } else {
                console.log('no question');
            }
        }(qotd.data));

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
                fetchResponses($scope.data.question._id);
            }).error(function (error) {
                $ionicLoading.show({template: '<i class="icon ion-alert"></i><br />Error: Something went wrong', duration:'1000'})
                console.log(error);
            });
        };

        
        function fetchResponses(questionID) {
            console.log('fetching responses');
            APIService.getResponses(questionID).success(function (result) {
                $scope.data.responses = result;


                // don't double add after a submission
                $scope.qotd.data = [];

                var r, total = 0, most;
                for (r in result) {
                    if (result.hasOwnProperty(r)) {
                        if (most === undefined || result[most].length < result[r].length) {
                            most = r;
                        }
                        total += result[r].length;


                        $scope.qotd.data.push({
                            key: r,
                            y: result[r].length
                        });
                    }
                }
                $scope.data.totalResponses = total;
                $scope.data.mostResponses = most;


                $ionicLoading.hide();
            }).error(function (error) {
                console.log(error);
            })
        }

        $scope.isAnswer = function (r) {
            console.log('isAnswer');
            if ($scope.data.responses[r]) {
                console.log('r', r);
                console.log('response', $scope.data.response);
                console.log('possibleAnswers', $scope.data.question.possibleAnswers);
                return (($scope.data.response.value == r) ||
                    ($scope.data.response.indexOf
                        && $scope.data.question.possibleAnswers.indexOf(r) !== -1
                        && $scope.data.response.value[$scope.data.question.possibleAnswers.indexOf(r)] !== null));
            }
        }

        $scope.getResponseClass = function (r) {
            console.log('response class ',r);
            console.log('responses', $scope.data.responses);
            if ($scope.data.responses[r]) {
                if (r === $scope.data.mostResponses) {
                    return 'badge badge-assertive';
                } else {
                    return 'badge badge-stable';
                }
            }
        }

    });
