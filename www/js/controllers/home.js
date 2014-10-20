/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.home', ['nvd3'])

    .filter('asAlpha', function () {
        return function (num) {
            var alphas = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo', 'twentythree'
            ];
            return alphas[num];
        };
    })

    .filter('majorHoursOnly', function () {
        return function (hour) {
            if (hour.value % 6 === 0) {
                return hour.text;
            }
        };
    })

    .controller('HomeCtrl', function($scope, $q, APIService, UserService, $ionicLoading, $ionicPopup, asPercentageFilter) {


        var backgroundBlue = '#2d3947';

        APIService.handshake().success(function () {

            $ionicLoading.hide();

            $scope.hasQotD = true;

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
                },
                answered: false
            };

            $scope.data = {};
            $scope.data.timeline = {
                days: []
            };

            function fetchQotDDistribution() {
                if (typeof UserService.get('uuid') === 'undefined') {
                    console.log('no uuid yet, trying again in 1 second');
                    return setTimeout(fetchQotDDistribution, 1000);
                }
                APIService.getQuestion(new Date(), true).success(function (question) {
                    if (question) {

                        $scope.qotd.title = question.content;

                        // determine if question has been answered
                        var answer, i, l;

                        for (answer in question.responses) {
                            if (question.responses.hasOwnProperty(answer)) {
                                l = question.responses[answer].length;

                                _.each(question.responses[answer], function(answer) {
                                  if (answer.userID === UserService.get('uuid')) {
                                      $scope.qotd.answered = true;
                                  }
                                });

                                $scope.qotd.data.push({
                                    key: answer,
                                    y: question.responses[answer].length
                                });

                            }
                        }

                    } else {
                        $scope.qotd.title = "No question available";
                        $scope.hasQotD = false;
                    }
                });
            }

            fetchQotDDistribution();

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
