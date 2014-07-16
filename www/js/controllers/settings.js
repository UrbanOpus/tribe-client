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
                                         $localNotificationService, toastService) {
        var mood_notify_defaults = {
            checked: false,
            time: 0
        };

        // attempt to fetch notification time if possible, otherwise
        // get defaults
        $scope.mood_notify = $localstorage.getObject('mood_notify') || mood_notify_defaults;

        $scope.updateSettings = function() {
            var current = $scope.mood_notify,
                onSuccess = current.checked
                    && $localNotificationService.scheduleMood.bind(this,$scope.mood_notify.time);

            $localNotificationService.cancel(onSuccess);

            $localstorage.setObject('mood_notify', current);
        };
    });
