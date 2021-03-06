/* global moment, angular */
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
            getUser: function () {
                return user;
            }
        };
    })
    
    .factory('APIService', function ($http) {
        // dev; comment out when commiting
        var url = 'http://localhost:3000/api/';
        // var url = 'http://108.59.80.64:3000/api/';

        console.log('api service init');

        return {
            handshake: function (uuid, timeout) {
                return $http.get(url, {timeout: timeout});
            },
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
                        urlString += '&';
                    } else {
                        urlString += '?';
                    }
                    urlString += 'timeEnd=' + timeEnd;
                }
                return $http.get(urlString);
            },
            postMood: function (mood) {
                return $http.post(url + 'moods/users/' + mood.uuid, mood);
            },
            getQuestion: function (date) {
                return $http.get(url + 'questions/date?sorted=true' + ((date) ? ('&date=' + date.valueOf()) : ''));
            },
            postQuestion: function (questionID, response) {
                return $http.post(url + 'questions/' + questionID + '/responses', response);
            },
            createUser: function (user) {
                return $http.post(url + 'users', user);
            },
            changeNickName: function (user, nickname) {
                var data = {
                  uuid: user,
                  nickname: nickname
                };

                console.log(data);

                return $http.post(url + 'changenickname', data);
            },
            getResponses: function (question) {
                return $http.get(url + 'questions/' + question + '/responses/sorted');
            },
            getTribeResponses: function (question, tribeID) {
                return $http.get(url + 'questions/' + question + '/' + tribeID + '/responses');
            },
            getTribes: function (uuid) {
                return $http.get(url + 'usertribe/' + uuid);
            },
            getAllTribes: function () {
                return $http.get(url + 'tribes/');
            },
            getTribeInfo: function (tribeID) {
                return $http.get(url + 'tribes/' + tribeID);
            },
            getTribeMood: function (tribeID) {
                return $http.get(url + 'moods/tribes/' + tribeID);
            },
            joinTribe: function (tribeID, uuid) {
                return $http.post(url + 'jointribe/' + tribeID, uuid);
            },
            leaveTribe: function (tribeID, uuid) {
                return $http.post(url + 'leavetribe/' + tribeID, uuid);
            },
            deleteUser: function (uuid) {
                return $http.delete(url + 'users', uuid);
            },
            unregisterUser: function (uuid) {
                return $http.delete(url + 'users/' + uuid + '/gcm');
            },
            registerUser: function (uuid, regid) {
                return $http.post(url + 'users/' + uuid + '/gcm', {registrationID: regid});
            },
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
                cancel: function() {}
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
                callback = callback || toastService.toast.bind(null, "Disabled mood mapping notifications", "short", "bottom");

                console.log("removing moodNotify task");
                service.cancel("moodNotify", callback);
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
