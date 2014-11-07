angular.module('tribe.demographic', ['angular-datepicker'])


    .controller('DemographicCtrl', function ($scope, $ionicPopup, $location, UserService, APIService) {

      $scope.options = {
        selectYears: true
      }

      $scope.user = {
        birthyear: ''
      }

      $scope.createUser = function(user) {
        validateForm(user);

        var submission = user;

        submission.uuid = UserService.get('uuid');

        submission.registrationID = UserService.get('registrationID');

        if (UserService.get('tribes')) {
          submission.tribeEnabled = true;
          UserService.set('tribeEnabled', true);
        } else {
          UserService.set('tribeEnabled', false);
        };

        APIService.createUser(submission).success(function (u) {
            $ionicPopup.alert({
                title: 'Success!',
                template: 'User created'
            }).then(function () {
                _.each(UserService.get('tribes'), function (t) {
                  var toSubmit = {
                    uuid: user.uuid
                  };
                  APIService.joinTribe(t, toSubmit);
                })
                $location.path('/app/home');
            });
        }).error(function (error) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Could not connect to the server.  Please check your network connection.'
            });
        });
      }

      function validateForm (user) {
        if (parseInt(user.birthyear) > parseInt(moment().format('YYYY'))) {
          $ionicPopup.alert({
              title: 'Invalid Year',
              template: 'Enter a valid year',
              okText: 'Close',
              okType: 'button-assertive'
          })
        }
      }
    });