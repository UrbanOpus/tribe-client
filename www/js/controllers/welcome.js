angular.module('tribe.welcome', [])


    .controller('WelcomeCtrl', function ($scope, $ionicPopup, $location, UserService, APIService) {
        $scope.data = {};


        $scope.data.times = [];
        $scope.data.time = '12:00 PM';

        var i, j, timeCount = 0;;

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

        $scope.logTime = function () {
            console.log($scope.data.time)
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

        $scope.data.time = nowHour + ':' + nowMinute + ' ' + nowAMPM;

        console.log($scope.data.times);


        //$scope.data.time = '12:00';

        $scope.notifyUser = function () {
            console.log($scope.data.time);
            var time = $scope.data.time.split(' '),
                timeStr;
            time[0] = time[0].split(':');
            time[0][0] = parseInt(time[0][0]) % 12;
            if (time[1] === 'PM') {
                time[0][0] += 12;
            }

            timeStr = time[0][0] + ':' + time[0][1];
            console.log(timeStr);
            var submission = {
                uuid: UserService.get('uuid'),
                notificationTime: timeStr,
                registrationID: UserService.get('registrationID')
            };

            APIService.createUser(submission).success(function (user) {
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'We\'ll notify you at ' + user.notificationTime + '!'
                }).then(function () {
                    $location.path('/app/home');
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Could not connect to the server.  Please check your network connection.'
                });
            });
        };

        $scope.dontNotifyUser = function () {
            // we have to create the user so that the welcome dialog does not popup every time the app starts up
            var submission = {
                uuid: UserService.get('uuid')
            };

            APIService.createUser(submission).success(function (user) {
                $ionicPopup.alert({
                    title: 'Success!',
                    template: 'User created'
                }).then(function () {
                    $location.path('/app/home');
                });
            }).error(function (error) {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: error
                });
            });

            $location.path('/app/home');
        }
    });