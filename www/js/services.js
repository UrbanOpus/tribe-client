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
            getMoodRange: function (uuid, timeStart, timeEnd) {
                var urlString = url + 'moods';
                if (uuid) {
                    urlString += '/users/' + uuid;
                }
                if (timeStart) {
                    urlString += '?timeStart=' + timeStart;
                }
                if (timeEnd) {
                    if (timeStart) {
                        urlString += '&'
                    } else {
                        urlString += '?'
                    }
                    urlString += 'timeEnd=' + timeEnd;
                }
                return $http.get(urlString);
            },
            postMood: function (mood) {
                return $http.post(url + 'moods/users/' + mood.uuid, mood);
            },
            getQuestion: function (date) {
                return $http.get(url + 'questions/date' + ((date) ? ('?date=' + date.getTime()) : ''));
            },
            postQuestion: function (questionID, response) {
                return $http.post(url + 'questions/' + questionID + '/responses', response);
            },
            createUser: function (user) {
                return $http.post(url + 'users', user);
            },
            getResponses: function (question) {
                return $http.get(url + 'questions/' + question + '/responses/sorted');
            },
            deleteUser: function (uuid) {
                return $http.delete(url + 'users', uuid);
            }
        };
    })

    .factory('$localNotificationService',
             ['$window', '$location', 'amMoment', 'toastService', '$state',
              function ($window, $location, amMoment, toastService, $state) {

        var services;

        // helper method
        // takes a timestring in format moment format: hh:mm a
        function getScheduleDate(timeString) {
            return moment(timeString, "hh:mm a").toDate();
        }

        // check if notification is supported, otherwise return a stub implementation
        if (!$window.plugin || !$window.plugin.notification) {
            console.log("No notification support on device");
            return {
                cancel: function() {},
                scheduleMood: function() {}
            };
        }

        console.log("Notification enabled on device");

        service = $window.plugin.notification.local;

        // register event on notification click
        service.onclick = function(id, state, json) {
            console.log(id, state, json);
            console.log($location.path());
            window.location = "#/app/mood#create";
        };

        return {
            cancel: function(callback) {
                callback = callback
                    || toastService.toast.bind(null, "Disabled mood mapping notifications", "short", "bottom");

                console.log("removing moodNotify task");
                service.cancel("moodNotify", callback);
            },
            scheduleMood: function(time) {
                var msg =  {
                    id: "moodNotify",
                    date:  getScheduleDate(time),
                    title: "Time to map your mood!",
                    message: "How are you feeling right now?",
                    repeat: 'daily',
                    autoCancel: true,
                    ongoing: false
                };

                service.add(msg, function() {
                    toastService.toast("Scheduled notifications for "+ time, "long", "bottom");
                });
            }
        };
    }])

    .factory('toastService', ['$window', function ($window) {

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
