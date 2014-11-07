angular.module('tribe.welcome', [])


    .controller('WelcomeCtrl', function ($scope, $ionicPopup, $location, UserService, APIService) {
        var TRIBE_LIMIT = 5;

        $scope.data = {};
        $scope.limit = TRIBE_LIMIT;
        $scope.selected = 0;

        var getTribes = function () {
            APIService.getAllTribes().success(function (result) {
                $scope.data.tribes = result;
                _.each($scope.data.tribes, function (tribe) {
                  tribe.selected = false;
                })
            }).error(function (error) {
                console.log(error);
            });
        };

        getTribes();

        $scope.change = function(tribe) {
          if ($scope.selected >= TRIBE_LIMIT) {
            tribe.selected = false;
          }
            
          $scope.selected = _.where($scope.data.tribes, {selected: true}).length;
        };

        $scope.next = function(tribe) {
          if ($scope.selected < 1 ) {
            $ionicPopup.alert({
                title: 'Leave Tribe',
                template: 'You must be in at least one Tribe!!!',
                okText: 'Close',
                okType: 'button-assertive'
            })
          } else {            
            UserService.set('tribes', _.pluck(_.where($scope.data.tribes, {selected: true}), '_id'));
            $location.url('/app/demographics');
          }
        };

    });