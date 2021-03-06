/**
 * Created by faide on 2014-07-13.
 */
angular.module('tribe.gcm', [])

.factory('PushProcessingService', function (APIService, UserService, $ionicPopup) {
        function onDeviceReady() {
          var pushNotification = window.plugins.pushNotification;
          pushNotification.unregister(function () {
            pushNotification.register(gcmSuccessHandler, gcmErrorHandler, {
                "senderID": "428350448350",
                "ecb": "onNotificationGCM"
            });
          });
        }

        function gcmSuccessHandler(result) {
            console.log(result);   
        }

        function gcmErrorHandler(error) {
            // error
        }

        return {
            initialize: function () {
                onDeviceReady();
            },
            registerID: function (id) {
              APIService.registerUser(UserService.get('uuid'), id);
              UserService.set('registrationID', id);
            },
            unregister: function () {
                var push = window.plugins.pushNotification;
                push.unregister(function () {
                    // success
                });
            }
        };
    });

function onNotificationGCM(e) {
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                var elem = angular.element(document.querySelector('[ng-app]'));
                var injector = elem.injector();
                var myService = injector.get('PushProcessingService');
                myService.registerID(e.regid);
            }
            break;
        case 'message':
            if (e.foreground) {
                // maybe do something?
            } else {
                window.location = '#/app/qotd';
            }
    }
}