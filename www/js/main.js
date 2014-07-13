var app = angular.module('tribe', ['ionic', 'tribe.controllers']);

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {
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
                controller: 'MainCtrl'
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
        url: '/qotd',
        views: {
            'menuContent': {
                templateUrl: 'templates/qotd.html',
                controller: 'QuestionCtrl'
            }
        }
    });
});