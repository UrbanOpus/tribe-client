/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.moods', ['google-maps'])


    .filter('asPercentage', function () {
        return function (value) {
            if (value < 0) {
                return (value * -1) + '% unhappy';
            } else {
                return value + '% happy';
            }
        };
    })

    .controller('MoodCtrl', function($scope, $ionicLoading, $ionicModal, $compile, APIService, UserService, asPercentageFilter) {
        var uuid = UserService.get('uuid');
        APIService.getMoods(uuid).success(function (result) {
            console.log(result);
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
            getMoods();
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


        // ---------------------------
        // mood fetching functionality
        // ---------------------------

        $scope.data.moods = [];

        var markers = [],
            allMarkers = [];

        var getMoods = function () {
            APIService.getMoods(uuid).success(function (result) {
                console.log(result);
                $scope.data.moods = result;
                generateMarkers($scope.data.moods, markers);
            }).error(function (error) {
                console.log(error);
            });
        };
        getMoods();

        $scope.userTab = function () {
            $scope.map.markers = markers;
        };

        $scope.globalTab = function () {
            if ($scope.data.allMoods) {
                $scope.map.markers = allMarkers;
            } else {
                $scope.data.allMoods = [];
                APIService.getMoods().success(function (result) {
                    $scope.data.allMoods = result;
                    generateMarkers($scope.data.allMoods, allMarkers);
                }).error(function (err) {
                    console.log(err);
                });
            }
        };


        // -----------------
        // map functionality
        // -----------------

        var backgroundBlue = '#2d3947';

        $scope.map = {
            center: {
                latitude: 49.25,
                longitude: -123.1
            },
            zoom: 10,
            options: {
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

        var generateMarkers = function (moods, list) {
            var i, l = moods.length, mood;

            for (i = 0; i < l; i += 1) {
                mood = moods[i];
                if (mood.location) {
                    console.log('new marker', mood);
                    list.push({
                        id: mood._id,
                        latitude: mood.location.latitude,
                        longitude: mood.location.longitude,
                        title: asPercentageFilter(mood.value)
                    });
                }
            }

            $scope.map.markers = list;
        };



    });