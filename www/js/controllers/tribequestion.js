/** jshint global angular **/

/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.tribeQuestion', ['angularMoment'])

    .filter('toDate', function () {
        return function (val) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            if (val) {
                return months[val.getMonth()] + ' ' + val.getDate() + ', ' + val.getFullYear();
            }
            return '';
        };
    })

    .filter('answered', function () {
        return function (val) {
            return (val) ? '(answered)' : '';
        };
    })

    .directive('responseBar', function () {
        function link(scope, element, attrs) {

        }
        return {
            link: link,
            restrict: 'A'
        };
    })

    .controller('TribeQuestionCtrl', function($scope, $ionicLoading, $stateParams, $location,
                                         APIService, uuid, qotd) {

        APIService.handshake().success(function () {
            // TODO: remove this, won't be loading until this anyhow
            $ionicLoading.hide();

            $scope.tribe = $stateParams.id;

            var today = moment();
            var setAnswered = function(response) {
                $scope.data.question.isAnswered = true;
                $scope.data.response = response;
                fetchResponses($scope.data.question._id, $scope.tribe);
            };

            $scope.data = {
                question: null,
                response: {
                    value: []
                },
                responses: [],
                isLatestDay: false,
                isAnswered: false,
                qDate: moment(),
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
                $scope.data.qDate = moment(parseInt($stateParams.date));
                //set 'today' to the currently active day
            }

            var yesterday = moment($scope.data.qDate).subtract(1, 'd'),
                tomorrow  = moment($scope.data.qDate).add(1, 'd');

            if ($scope.data.qDate.month() === today.month() &&
                $scope.data.qDate.date()   === today.date() &&
                $scope.data.qDate.year()  === today.year()) {
                $scope.data.isLatestDay = true;
            }

            $scope.goBack = function () {
                $location.url('/app/triberesult?date=' + yesterday.valueOf() + '&id=' + $scope.tribe);
            };
            $scope.goForward = function () {
                $location.url('/app/triberesult?date=' + tomorrow.valueOf() + '&id=' + $scope.tribe);
            };

//        APIService.getQuestion($scope.data.qDate).success(function (result) {
            // TODO: remove this IIFE, not sure whether we need to isolate
            if (qotd.data) {
                $scope.data.question = qotd.data;

                if (moment($scope.data.question.expireOn) < moment()) {
                  $scope.data.expired = true;
                }

                var userResponse;
                if ($scope.data.question) {
                    userResponse = _.chain($scope.data.question.responses)
                        .map(function(userResponses) {
                            return _.findWhere(userResponses, {userID: uuid});
                        })
                        .compact().first().value();
                }

                //determine if answered, if it is -- set the response fields
                if (userResponse) {
                    $scope.data.question.isAnswered = true;

                    $scope.data.response = userResponse;
                    $scope.data.location.enabled = !(!$scope.data.response.location);

                    fetchResponses($scope.data.question._id, $scope.tribe);

                    // // since we've answered it already, load the responses
                    // // TODO: load the responses when Michael sorts
                    // // using the API
                    // (function(responses) {
                    //     var result = responses;
                    //     $scope.data.responses = result;

                    //     // don't double add after a submission

                    //     var r, total = 0, most;
                    //     for (r in result) {
                    //         if (result.hasOwnProperty(r)) {
                    //             if (most === undefined || result[most].length < result[r].length) {
                    //                 most = r;
                    //             }
                    //             total += result[r].length;


                    //             $scope.qotd.data.push({
                    //                 key: r,
                    //                 y: result[r].length
                    //             });
                    //         }
                    //     }
                    //     $scope.data.totalResponses = total;
                    //     $scope.data.mostResponses = most;

                    // })(qotd.data.responses);
                }
            } else {
                console.log('no question');
            }

            $scope.submitResponse = function () {
                $ionicLoading.show({
                    template:'<i class="icon ion-loading-c"></i><br />Getting location'
                });

                if ('geolocation' in navigator) {
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

                var submission = {
                    userID: uuid,
                    value: $scope.data.response.value,
                    location: $scope.data.location.coords
                };


                APIService.postQuestion($scope.data.question._id, submission).success(function (result) {
                    $ionicLoading.show({template: '<i class="icon ion-checkmark"></i><br />Success!', duration:'500'});
                    setAnswered(submission);
                }).error(function (error) {
                    $ionicLoading.show({template: '<i class="icon ion-alert"></i><br />Error: Something went wrong', duration:'1000'});
                    console.log(error);
                });
            };


            function fetchResponses(questionID, tribeID) {
                APIService.getTribeResponses(questionID, tribeID).success(function (result) {

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
                });
            }

            $scope.isAnswer = function (r) {
                if ($scope.data.responses[r]) {
                    return (($scope.data.response.value == r) || ($scope.data.response.indexOf && $scope.data.question.possibleAnswers.indexOf(r) !== -1 && $scope.data.response.value[$scope.data.question.possibleAnswers.indexOf(r)] !== null));
                }
            };

            $scope.getResponseClass = function (r) {
                if ($scope.data.responses[r]) {
                    if (r === $scope.data.mostResponses) {
                        return 'badge badge-assertive';
                    } else {
                        return 'badge badge-stable';
                    }
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
