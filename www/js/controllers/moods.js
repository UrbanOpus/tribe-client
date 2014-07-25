/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.moods', ['ionic', 'google-maps'])
    .filter('asPercentage', function () {
        return function (value) {
            if (value < 0) {
                return (value * -1) + '% unhappy';
            } else {
                return value + '% happy';
            }
        };
    })

    .filter('reverse', function () {
        return function (array) {
            return array.slice().reverse();
        }
    })

    .directive('tribeMoodTimeline', function () {
        function link (scope, element, attrs) {

            scope.fetchDateRange = scope.onScroll;

        }

        return {
            link: link,
            restrict: 'E',
            scope: {
                moods: '=',
                timeline: '=',
                onScroll: '&'
            },
            transclude: true,
            templateUrl: 'templates/timeline.html'
        }
    })

    .directive('tribeTimelineDay', function () {
        function link(scope, element, attrs) {

            if (scope.$last) {
                element.css('border-right', '1px solid #DDD');
            }

        }
        return {
            link: link,
            restrict: 'E',
            templateUrl: 'templates/dayItem.html'
        }
    })

    .directive('tribeMood', function ($ionicScrollDelegate) {
        function link(scope, element, attrs) {
            var offsetY, scroller,offsetX,
                originTime = new Date(scope.timeline.origin).getTime();
            // first is the oldest, so we offset by that amount
            if (scope.$first) {
                scope.$parent.origin = originTime
            }


            offsetY = ((scope.mood.value + 100) / 4) + 25;
            offsetX = scope.timeline.widthPX * (new Date(scope.mood.createdAt).getTime() - scope.$parent.origin) / scope.timeline.widthMS;

            var yellow = "#fcf357",
                green = "#00ed3f",
                red = "#fc6355";

            element
                .css('position', 'absolute')
                .css('bottom', offsetY + 'px')
                .css('left', offsetX + 'px')
                .css('border', '2px solid ' + ((scope.mood.value < -33) ? red : (scope.mood.value > 33) ? green : yellow));

            if (scope.$last) {
                scroller = $ionicScrollDelegate.$getByHandle('timeline');
                scroller.scrollTo((offsetX - (scope.timeline.widthPX / 2)), 0, true);
            }
        }

        return {
            link: link,
            restrict: 'E',
            template: '<div class="mood-timeline-entry"></div>',
            transclude: true
        }
    })

    .controller('MoodCtrl', function($scope, $ionicLoading, $ionicModal, $ionicScrollDelegate, $location, $timeout, APIService, UserService, asPercentageFilter) {


        APIService.handshake().success(function () {


            var uuid = UserService.get('uuid');
            APIService.getMoods(uuid).success(function (result) {
            });

            // --------------------
            // modal functionality
            // --------------------

            $ionicModal.fromTemplateUrl('templates/createMood.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.openModal = function() {
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function() {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function() {
                // Execute action
            });


            // ---------------------------
            // mood creation functionality
            // ---------------------------

            $scope.data = {};
            $scope.data.rangeColor = "range-energized";
            $scope.data.rangeValue = 0;
            $scope.data.location = {
                status: 'Use location',
                enabled: false,
                unavailable: false,
                coords: null
            };

            $scope.submit = function () {
                $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Submitting...'})
                var toSubmit = {
                    uuid: UserService.get('uuid'),
                    location: $scope.data.location.coords,
                    value: $scope.data.rangeValue
                };

                APIService.postMood(toSubmit).success(function (result) {
                    $ionicLoading.show({template: '<i class="icon ion-checkmark"></i><br />Success!', duration:'500'})
                    $scope.modal.hide();
                    console.log('success',result);

                    getMoods();
                }).error(function (err) {
                    $ionicLoading.show({template: '<i class="icon ion-alert"></i><br />Error: Something went wrong', duration:'1000'})
                    $scope.modal.hide();
                    console.log('error', err);
                });
            };

            $scope.setColor = function () {
                var value = $scope.data.rangeValue;
                if (value < -33) {
                    $scope.data.rangeColor = "range-assertive";
                } else if (value > 33) {
                    $scope.data.rangeColor = "range-balanced";
                } else {
                    $scope.data.rangeColor = "range-energized";
                }
            };

            $scope.setLocation = function () {
                console.log('setting location');
                var timeout = 20000;
                if ($scope.data.location.enabled) {
                    if ('geolocation' in navigator) {
                        $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Getting location', duration: timeout});
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            console.log('success');
                            $ionicLoading.hide();
                            $scope.data.location.coords = pos.coords;
                        }, function () {
                            console.log('timeout');
                            $ionicLoading.hide();
                            $scope.data.location.status = 'Location is unavailable';
                            $scope.data.location.enabled = false;
                            $scope.data.location.unavailable = true;
                        }, {enableHighAccuracy: true, maximumAge: 60000, timeout: timeout});
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


            // ---------------------------
            // mood fetching functionality
            // ---------------------------

            $scope.data.moods = [];

            $scope.isLocal = true;

            var markers = [],
                allMarkers = [];

            var getMoods = function () {
                APIService.getMoods(uuid).success(function (result) {
                    console.log('getting moods');
                    $scope.data.moods = result;
                    $scope.map.markers = generateMarkers($scope.data.moods, markers);
                }).error(function (error) {
                    console.log(error);
                });
            };
            getMoods();


            // -----------------
            // map functionality
            // -----------------

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


            $scope.userTab = function () {
                $scope.map.markers = markers;
                $scope.isLocal = true;
                //fitMap();

            };

            $scope.globalTab = function () {
                $scope.isLocal = false;
                if ($scope.data.allMoods) {
                    $scope.map.markers = allMarkers;
                } else {
                    $scope.data.allMoods = [];
                    APIService.getMoods().success(function (result) {
                        console.log('all moods', result);
                        $scope.data.allMoods = result.filter(function (mood) {
                            return mood.location;
                        });
                        console.log('all moods with location:', $scope.data.allMoods);
                        //$scope.data.allMoods = result;
                        generateTimeline();
                        $scope.map.markers = generateMarkers($scope.data.allMoods, allMarkers);
                    }).error(function (err) {
                        console.log(err);
                    });
                }
            };

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
                            icon: (mood.value < -33) ? 'img/red-dot.png' : (mood.value > 33) ? 'img/green-dot.png' : 'img/yellow-dot.png'
                        });
                    }
                }

                console.log('generated markers:', list);

                return list;
            };


            // -----------------------
            // timeline functionality
            // -----------------------

            $scope.data.timeline = {
                days: []
            };

            function generateTimeline() {
                var dayInMilliseconds = 1000 * 60 * 60 * 24,
                    dayInPx = 500,
                    earliestTime = new Date($scope.data.allMoods[0].createdAt),
                    earliestDay  = new Date(earliestTime.getFullYear(), earliestTime.getMonth(), earliestTime.getDate()),
                    numDays = ((new Date().getTime() - earliestDay.getTime()) / dayInMilliseconds),
                    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                    i, day;


                for (i = 0; i < numDays; i += 1) {
                    day = new Date(earliestDay.getTime() + (i * dayInMilliseconds));
                    $scope.data.timeline.days.push({
                        utc: day.getTime(),
                        dateString: months[day.getMonth()] + ' ' + day.getDate()
                    });
                }

                $scope.data.timeline.origin  = earliestDay;
                $scope.data.timeline.widthPX = dayInPx;
                $scope.data.timeline.widthMS = dayInMilliseconds;


            }

            var getByDateRange = function (list, begin, end) {

                var allAfter = list.filter(function (mood) {
                        return new Date(mood.createdAt) > new Date(begin);
                    }),
                    allBeforeAndAfter = allAfter.filter(function (mood) {
                        return new Date(mood.createdAt) < new Date(end);
                    });


                return allBeforeAndAfter;
            };
            $scope.fetchDateRange = ionic.debounce(function () {
                var left = $ionicScrollDelegate.$getByHandle('timeline').getScrollPosition().left,
                    right = left + 500,
                    beginDate = new Date($scope.data.timeline.origin).getTime() + (left / $scope.data.timeline.widthPX * $scope.data.timeline.widthMS),
                    endDate   = new Date($scope.data.timeline.origin).getTime() + (right / $scope.data.timeline.widthPX * $scope.data.timeline.widthMS);

                console.log('run');

                $scope.map.markers = generateMarkers(getByDateRange($scope.data.allMoods, beginDate, endDate));
                fitMap();
            }, 500);

            var fitMap = function () {
                console.log('fitting map');
                if ($scope.map) {
                    var minBounds = {
                        nw: new google.maps.LatLng(49.196073,-123.319727),
                        se: new google.maps.LatLng(49.303868,-122.880273)
                    };

                    var latlngbounds = new google.maps.LatLngBounds(minBounds.nw, minBounds.se);

                    var map = $scope.map.control.getGMap();
                    if ($scope.map.markers.length) {
                        $scope.map.markers.forEach(function(n) {
                            latlngbounds.extend(new google.maps.LatLng(n.latitude, n.longitude));
                        });
                    }
                    map.fitBounds(latlngbounds);
                }
            };

            // open modal on #create


            if ($location.hash() === 'create') {
                // delay to let the modal load
                $timeout($scope.openModal, 1000);
            }



        }).error(function () {
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: 'Connection error',
                template: 'Server could not be reached.  Please check your internet connection.',
                okText: 'Close App',
                okType: 'button-assertive'
            }).then(function (res) {
                navigator.app.exitApp();
            })
        })

    });
