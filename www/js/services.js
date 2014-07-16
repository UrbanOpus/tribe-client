/* jshint global moment, angular */
angular.module('tribe.services', [])

    .factory('UserService', function () {
        var user = {};

        return {
            set: function (attr, value) {
                console.log('setting user.' + attr + ' to ' + value);
                user[attr] = value;
            },
            get: function (attr) {
                return user[attr];
            },
            getUser: function (user) {
                return user;
            }
        };
    })

    .factory('APIService', function ($http) {
        // dev; comment out when commiting
        //var url = 'http://localhost:3000/api/';
        var url = 'http://108.59.80.64:3000/api/';

        console.log('api service init');

        return {
            getUser: function (uuid) {
                console.log('getting user', uuid);
                return $http.get(url + 'users/' + uuid);
            },
            getMoods: function (uuid) {
                if (uuid) {
                    return $http.get(url + 'moods/users/' + uuid);
                } else {
                    return $http.get(url + 'moods');
                }
            },
            postMood: function (mood) {
                return $http.post(url + 'moods/users/' + mood.uuid, mood);
            },
            getQuestion: function (date) {
                return $http.get(url + 'questions/date' + ((date) ? ('/' + date) : ''));
            },
            postQuestion: function (questionID, response) {
                return $http.post(url + 'questions/' + questionID + '/responses', response);
            },
            createUser: function (user) {
                return $http.post(url + 'users', user);
            }
        };
    })

    .factory('$localNotificationService',
             ['$window', '$location', 'amMoment', '$toastService', 
              function ($window, $location, amMoment, $toastService) {

        // check if notification is supported, otherwise return a stub implementation
        if (!$window.plugin || !$window.plugin.notification) {
            console.log("No notification support on device");
            return {
                cancelAll: function() {},
                scheduleMood: function() {}
            };
        }

        console.log("Notification enabled on device");
                 
        var service = $window.plugin.notification.local;

        function getScheduleDate(timeString) {
            var duration = moment.duration(timeString);
            console.log("duration", timeString, duration);

            return moment().startOf('day').add(duration).toDate();
        }

        // register event on notification click
        service.onclick = function(id, state, json) {
            console.log(id, state, json);
            console.log($location.path());
            window.location = "#/app/mood";
        };

        service.onadd = function(id, state, json) {
            $toastService.toast("Scheduled notification successfully",
                                "long", "bottom");
        };
                 
        return {
            cancel: function(successCallback) {
                console.log("removing moodNotify task");
                service.cancel("moodNotify", successCallback || function() {});
            },
            scheduleMood: function(time) {
                console.log("scheduling tasks for time", time);
                service.add({
                    id: "moodNotify",
                    date:  getScheduleDate(time),
                    title: "Time to map your mood!",
                    message: "How about telling us how you're feeling right now?",
                    repeat: 'daily',
                    ongoing: false
                });
            }
        };
    }])

    .factory('$toastService', ['$window', function ($window) {

        if (!$window.plugins || !$window.plugins.toast) {
            console.log("no toast support");
            return {
                toast: function() {}
            };
        }

        console.log("toast loaded");
        return {
            toast: function (text, duration, position) {
                duration = duration || "long";
                position = position || "bottom";
                $window.plugins.toast.show(text, duration, position);
            }
        };
    }]);
