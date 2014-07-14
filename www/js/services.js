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
        var url = 'http://108.59.80.64:3000/api/';

        console.log('api service init');

        return {
            getUser: function (uuid) {
                console.log('getting user', uuid);
                return $http.get(url + 'users/' + uuid);
            },
            getMoods: function (uuid) {
                return $http.get(url + 'moods/users/' + uuid);
            },
            postMood: function (mood) {
                return $http.post(url + 'moods/users/' + mood.uuid, mood);
            },
            getQuestion: function (date) {
                return $http.get(url + 'questions/date' + ((date) ? ('/' + date) : ''));
            },
            postQuestion: function (questionID, response) {
                return $http.post(url + 'questions/' + questionID + '/responses', response);
            }
        }
    });