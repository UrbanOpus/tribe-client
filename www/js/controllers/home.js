/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.home', ['nvd3'])

    .filter('asAlpha', function () {
        return function (num) {
            var alphas = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo', 'twentythree'
            ];
            return alphas[num];
        }
    })

    .filter('majorHoursOnly', function () {
        return function (hour) {
            if (hour.value % 6 === 0) {
                return hour.text;
            }
        }
    })

    .directive('moodMarker', function () {
        function link(scope, el, attrs) {
            var now = moment(),
                time_diff = now.diff(moment(scope.mood.createdAt)),
                hour_in_ms = 60 * 60 * 1000;

            // 1 hour = 4.166..% (24 hours = 100% width)

            var offsetX = (time_diff / hour_in_ms) * 4.1666,
                offsetY = (scope.mood.value + 100) / 2;


            var yellow = "#fcf357",
                green = "#00ed3f",
                red = "#fc6355";

            el
                .css('bottom', offsetY + 'px')
                .css('right', offsetX + '%')
                .css('border', '2px solid ' + ((scope.mood.value < -33) ? red : (scope.mood.value > 33) ? green : yellow));
        }

        return {
            link: link,
            restrict: 'C',
            transclude: true
        }
    })

    .directive('tribeDashboardTimeline', function () {
        function link(scope, el, attrs) {
            var now = moment(),
                minutes = now.minutes(),
                hour = now.startOf('hour'),
                i;
            scope.data = {};
            scope.data.hours = [];


            scope.data.hour_offset = (((60 - minutes) / 60) * 4.166);


            console.log('moods', scope.moods);

            // use unshift instead of push to obtain hours in order from left to right

            hour = hour.add(1, 'hours');

            for (i = 0; i < 24; i += 1) {
                hour = hour.subtract(1, 'hours');
                scope.data.hours.unshift({
                    'text': hour.format('hA'),
                    'value': hour.format('H')
                });
            }

        }

        return {
            restrict: 'E',
            link: link,
            scope: {
                moods: '='
            },
            templateUrl: 'templates/dashboardTimeline.html'
        };
    })

    .controller('HomeCtrl', function($scope, $q, APIService, UserService, $ionicLoading, asPercentageFilter) {

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

                console.log('question');
                console.log(!!question);
                if (question) {

                    $scope.qotd.title = question.content;

                    // determine if question has been answered
                    var answer, i, l;

                    console.log('question', question);

                    for (answer in question.responses) {
                        if (question.responses.hasOwnProperty(answer)) {
                            l = question.responses[answer].length;

                            for (i = 0; i < l; i += 1) {
                                if (question.responses[answer][i].userID === UserService.get('uuid')) {
                                    $scope.qotd.answered = true;
                                    console.log('answered');
                                }
                            }

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



        var backgroundBlue = '#2d3947';

        $scope.map = {
            center: {
                latitude: 49.25,
                longitude: -123.1
            },
            control: {},
            zoom: 10,
            options: {
                maxZoom: 15,
                disableDefaultUI: true,
                styles: [
                    {
                        stylers: [
                            { hue: backgroundBlue },
                            { visibility: 'simplified' },
                            { gamma: 0.5 },
                            { weight: 0.5 }
                        ]
                    },
                    {
                        elementType: 'labels',
                        stylers: [
                            { visibility: 'off' }
                        ]
                    },
                    {
                        featureType: 'water',
                        stylers: [
                            { color: backgroundBlue }
                        ]
                    }
                ]
            },
            markers: []
        };




        // ---------------------------
        // mood creation functionality
        // ---------------------------

        $scope.mood = {};

        $scope.mood.submitted = false;
        $scope.mood.rangeColor = "range-energized";
        $scope.mood.rangeValue = 0;
        $scope.mood.location = {
            status: 'Use location',
            enabled: false,
            unavailable: false,
            coords: null
        };

        $scope.submit = function () {
            $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Submitting...'})
            var toSubmit = {
                uuid: UserService.get('uuid'),
                location: $scope.mood.location.coords,
                value: $scope.mood.rangeValue
            };

            APIService.postMood(toSubmit).success(function (result) {
                $ionicLoading.show({template: '<i class="icon ion-checkmark"></i><br />Success!', duration:'500'})
                console.log('success',result);
                $scope.data.allMoods.push(result);

                $scope.mood.submitted = true;

            }).error(function (err) {
                $ionicLoading.show({template: '<i class="icon ion-alert"></i><br />Error: Something went wrong', duration:'1000'})
                console.log('error', err);
            });
        };

        $scope.setColor = function () {
            var value = $scope.mood.rangeValue;
            if (value < -33) {
                $scope.mood.rangeColor = "range-assertive";
            } else if (value > 33) {
                $scope.mood.rangeColor = "range-balanced";
            } else {
                $scope.mood.rangeColor = "range-energized";
            }
        };

        $scope.setLocation = function () {
            console.log('setting location');
            var timeout = 20000;
            if ($scope.mood.location.enabled) {
                if ('geolocation' in navigator) {
                    $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Getting location', duration: timeout});
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        console.log('success');
                        $ionicLoading.hide();
                        $scope.mood.location.coords = pos.coords;
                    }, function () {
                        console.log('timeout');
                        $ionicLoading.hide();
                        $scope.mood.location.status = 'Location is unavailable';
                        $scope.mood.location.enabled = false;
                        $scope.mood.location.unavailable = true;
                    }, {enableHighAccuracy: true, maximumAge: 60000, timeout: timeout});
                } else {
                    $scope.mood.location.status = 'Location is unavailable';
                    $scope.mood.location.enabled = false;
                    $scope.mood.location.unavailable = true;
                }
            } else {
                $scope.mood.location.coords = null;
            }
        };


        var allMarkers = [];
        var generateMarkers = function (moods, list) {
            var i, l = moods.length, mood;

            list = list || [];

            for (i = 0; i < l; i += 1) {
                mood = moods[i];
                if (mood.location) {
                    list.push({
                        id: mood._id,
                        latitude: mood.location.latitude,
                        longitude: mood.location.longitude,
                        title: asPercentageFilter(mood.value),
                        icon: (mood.value < -33) ? 'img/red-dot.png' : (mood.value > 33) ? 'img/green-dot.png' : 'img/yellow-dot.png',
                    });
                }
            }

            console.log('generated markers:', list);

            return list;
        };

        APIService.getMoodRange(null, moment().subtract(24, 'hours')).success(function (result) {
            console.log('all moods', result);
            $scope.data.allMoods = result;
            //generateTimeline();
            $scope.map.markers = generateMarkers($scope.data.allMoods);
        }).error(function (err) {
            console.log(err);
        });

        fetchQotDDistribution();

    });
