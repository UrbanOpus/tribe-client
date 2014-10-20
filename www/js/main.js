var app = angular.module('tribe',
                         ['ionic',
                          'tribe.home', 'tribe.moods','tribe.questions', 'tribe.welcome',
                          'tribe.settings', 'tribe.services', 'tribe.gcm', 'tribe.filters',
                          'tribe.tribes', 'tribe.search', 'tribe.tribeinfo',
                          'angular-datepicker', 'angularMoment']);

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

//    $httpProvider.interceptors.push(function ($rootScope) {
//        return {
//            request: function (config) {
//                console.group('request');
//                console.log(config);
//                //$rootScope.$broadcast('loading:show');
//                return config;
//            },
//            response: function (response) {
//                console.log('response',response);
//                console.groupEnd();
//                //$rootScope.$broadcast('loading:hide');
//                return response;
//            }
//        }
//    });
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';

    $urlRouterProvider.otherwise('/app/home');

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html'
    });

    $stateProvider.state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    });

    $stateProvider.state('app.mood', {
        url: '/mood',
        views: {
            'menuContent': {
                templateUrl: 'templates/mood.html',
                controller: 'MoodCtrl'
            }
        }
    });

    $stateProvider.state('app.qotd', {
        url: '/qotd?date',
        views: {
            'menuContent': {
                resolve: {
                    'qotd': function($stateParams, $ionicLoading, APIService) {
                        var date = new Date();

                        if ($stateParams.date) {
                            date = new Date(parseInt($stateParams.date));
                        }

                        $ionicLoading.show({
                            template: '<i class="icon ion-loading-c"></i><br />Loading Question',
                            duration: 5000
                        });
                        return APIService.getQuestion(date);
                    },
                    'uuid': function(UserService) {
                        return UserService.get('uuid');
                    }
                },
                templateUrl: 'templates/qotd.html',
                controller: 'QuestionCtrl'
            }
        }
    });

    $stateProvider.state('app.tribes', {
        url: '/tribes',
        views: {
            'menuContent': {
                templateUrl: 'templates/tribes.html',
                controller: 'TribeCtrl'
            }
        }
    });


    $stateProvider.state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/searchtribe.html',
                controller: 'SearchCtrl'
            }
        }
    });

    $stateProvider.state('app.tribeInfo', {
        url: '/tribe?id',
        views: {
            'menuContent': {
                resolve: {
                    'tribe': function($stateParams, $ionicLoading, APIService) {
                        if ($stateParams.id) {
                            var id = $stateParams.id;
                        }

                        $ionicLoading.show({
                            template: '<i class="icon ion-loading-c"></i><br />Loading Question'
                        });

                        return APIService.getTribeInfo(id);
                    }
                },
                templateUrl: 'templates/tribeinfo.html',
                controller: 'TribeInfoCtrl'
            }
        }
    });

    $stateProvider.state('app.welcome', {
        url: '/welcome',
        views: {
            'menuContent': {
                templateUrl: 'templates/welcome_prompt.html',
                controller: 'WelcomeCtrl'
            }
        }
    });

   $stateProvider.state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });

    $stateProvider.state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'templates/about.html'
            }
        }
    });
});

app.run(function($rootScope, $ionicLoading, $ionicPopup, $ionicPlatform, $http, $location, UserService, APIService, PushProcessingService) {
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({template: '<i class="icon ion-loading-c"></i><br />Loading...', duration: 5000});
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $ionicPlatform.ready(function() {



        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)an
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        // get device uuid
        var device = window.device || {uuid: "browser-test", platform: "browser"};

        var uuid = device.uuid;

        UserService.set('uuid', uuid);

        APIService.getUser(uuid).success(function (data) {
            $location.path('/app/home');
        }).error(function () {
            if (device.platform === 'android' || device.platform === 'Android' || device.platform === 'browser') {
                $location.path('/app/welcome');

                if (device.platform !== 'browser') {
                    PushProcessingService.initialize();
                }

            } else {
                UserService.set('registrationID', 'testRegid');
                $location.path('/app/home');


            }
        });
        // get gcm registration id

        if (device.platform === 'android' || device.platform === 'Android') {
            PushProcessingService.initialize();
        }
    });


});
