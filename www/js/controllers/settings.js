// Created by rayh

angular.module('tribe.settings', ['ionic'])

    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }])

    .controller('SettingsCtrl', function($scope, $localstorage,
                                         $localNotificationService, toastService, APIService, UserService, $ionicPopup) {
        $scope.data = {};
        $scope.data.times = [];

        var i, j, timeCount = 0;

        // AM times

        for (i = 0; i < 12; i += 1) {
            for (j = 0; j < 60; j += 15) {
                $scope.data.times.push((i === 0 ? '12' : i) + ':' + (j === 0 ? '00' : j) + ' AM');
                timeCount += 1;
            }
        }

        // PM times

        for (i = 0; i < 12; i += 1) {
            for (j = 0; j < 60; j += 15) {
                $scope.data.times.push((i === 0 ? '12' : i) + ':' + (j === 0 ? '00' : j) + ' PM');
                timeCount += 1;
            }
        }

        // detect closest time
        var now = new Date(),
            nowHour   = now.getHours(),
            nowMinute = now.getMinutes(),
            nowAMPM   = now.getHours() < 12 ? 'AM' : 'PM';

        nowHour = nowHour % 12;
        if (nowHour === 0) {
            nowHour = 12;
        }

        // get the nextclosest 15 minute interval
        nowMinute = ((((nowMinute / 15) | 0) + 1) * 15) % 60;
        if (nowMinute === 0) {
            nowMinute = '00';
            nowHour += 1;
        }

        if (nowHour === 12) {
            nowAMPM = (nowAMPM === 'AM') ? 'PM' : 'AM';
        }

        console.log($scope.data.times);

        // attempt to fetch notification time if possible, otherwise
        // get defaults
        try {
            $scope.mood_notify = $localstorage.getObject('mood_notify');
            if (!('time' in $scope.mood_notify)) {
                $scope.mood_notify.time = nowHour + ':' + nowMinute + ' ' + nowAMPM;
            }
        } catch (e) {
            $scope.mood_notify = {
                time: nowHour + ':' + nowMinute + ' ' + nowAMPM,
                checked: false
            };
        }
        
        $scope.updateSettings = function() {
            var onSuccess;
            // if someone cleared the input -- treat it as an implicit
            // disable by setting it to the default
            if ($scope.mood_notify.time === "") {
                $scope.mood_notify.checked = false;
            }
            
            onSuccess = $scope.mood_notify.checked && function () { $localNotificationService.scheduleMood($scope.mood_notify.time); };

            $localNotificationService.cancel(onSuccess);

            $localstorage.setObject('mood_notify', $scope.mood_notify);
        };

        $scope.deleteUser = function () {
            APIService.deleteUser(UserService.get('uuid')).success(function () {
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'User deleted'
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'User does not exist (already deleted?)'
                });
            });
        };
    });
