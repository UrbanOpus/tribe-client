/**
 * Created by faide on 2014-06-23.
 */
// this has to be defined globally
var userid = null,
    regid = null,
    onNotification = function (e) {
    //window.plugins.toast.showLongBottom(e);
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0) {
                //window.plugins.toast.showLongBottom(e.regid);
                regid = e.regid;
                if (userid) {
                    $.ajax({
                        url: config.api + 'users/' + userid + 'gcm',
                        method: 'PUT',
                        data: {
                            registrationID: regid
                        },
                        success: function (msg) {
                            // done
                            toast.showLongBottom('Registered successfully');
                        },
                        error: function (error) {
                            alert(error.responseText);
                        }
                    });
                }
            }
            break;
        case 'message':
            $('body').pagecontainer('change', '#questionPage');
    }
};

(function ($) {
    /*
     * we use the device's uuid to identify a user when they use the app;
     * this is unique enough for us:
     *  - on iOS, uuid is a guaranteed unique value
     *  - on Android, uuid is a random 64-bit integer
     *
     * Limitations of using uuid:
     *  - Can be spoofed
     *  - Users who switch phones will not be able to retrieve their old data
     */
    var uuid    = null,
        storage = null,
        toast,
        pushNotification,

        _getFormData = function (formSelector) {
            var $form = $(formSelector),
                raw_data = $form.serializeArray(),
                post_data = {},
                i,
                num = raw_data.length;

            /*
             * jQuery serializes form data as an array of tuples, we need to massage
             *  this array into a JSON object
             */
            for (i = 0; i < num; i += 1) {
                post_data[raw_data[i].name] = raw_data[i].value;
            }
            return post_data;
        },
        formatTime = function (datetime) {
            var date    = new Date(Date.parse(datetime)),
                day     = date.getDate(),
                month   = date.getMonth(),
                year    = date.getFullYear(),
                hour    = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours(),
                minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();

            return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
        },
        formatDate = function (datetime) {
            var date    = new Date(Date.parse(datetime)),
                day     = date.getDate(),
                month   = date.getMonth(),
                year    = date.getFullYear();

            return day + '/' + month + '/' + year;
        },
        // AJAX form submission
        submitMoodAJAX = function () {
            if (uuid === null) {
                mood_history.set('status', 'Error: could not find device id, or device not ready yet.');
                return false;
            }
            var post_data = _getFormData('form#moodForm');

            // reconfigure location data
            if (post_data.loc_latitude && post_data.loc_longitude) {
                post_data.location = {
                    latitude:  post_data.loc_latitude,
                    longitude: post_data.loc_longitude
                };
                post_data.loc_latitude  = undefined;
                post_data.loc_longitude = undefined;
            }

            console.log(post_data);

            // send the ajax request
            $.ajax({
                data: post_data,
                url: config.api + 'moods/users/' + uuid,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    $('span#formStatus').text('Submission successful');
                    mood_history.set('status', "");
                    mood_history.set('moods', mood_history.get('moods').concat(data));
                },
                error: function (error) {
                    mood_history.set('status', 'Error: ' + JSON.stringify(error));
                }
            });


            // prevent default form submission
            return false;
        },
        submitQuestionAJAX = function () {
            var post_data, field;
            if (uuid === null) {
                mood_history.set('status', 'Error: could not find device id, or device not ready yet.');
                return false;
            }

            post_data = _getFormData('form#questionResponse');


            // gather multiple choice answers into an array (if non-exclusive)
            if (post_data.questionType === 'mc') {
                post_data.value = [];
                for (field in post_data) {
                    if (post_data.hasOwnProperty(field) && field.substr(0,9) === 'response_') {
                        post_data.value.push(parseInt(field.substr(9)));
                    }
                }
            }

            // reconfigure location data
            if (post_data.loc_latitude && post_data.loc_longitude) {
                post_data.location = {
                    latitude:  post_data.loc_latitude,
                    longitude: post_data.loc_longitude
                };
                post_data.loc_latitude  = undefined;
                post_data.loc_longitude = undefined;
            }

            post_data.userID = uuid;

            $.ajax({
                url: config.api + 'questions/' + post_data.questionID + '/responses',
                type: 'post',
                data: post_data,
                success: function (data) {
                    question_content.set('status', 'Submission successful');
                },
                error: function (error) {
                    question_content.set('status', 'Error: ' + JSON.stringify(error));
                }
            });


            return false;
        },
        fetchMoodHistory = function () {
            $.ajax({
                url: config.api + 'moods/users/' + uuid,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    mood_history.set('moods', data);
                    mood_history.set('status', "");
                },
                error: function (error) {
                    mood_history.set('status', 'Error: ' + JSON.stringify(error));
                }
            });
        },
        generateQuestionPage = function () {
            $.ajax({
                url: config.api + 'questions?orderBy=createdAt&orderDir=desc&limit=1',
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    var question  = data[0],
                        l = question.responses.length,
                        numAnswers = question.possibleAnswers.length,
                        i, j, k,
                        answer,
                        response;

                    console.log(question);
                    // modify the question data for insertion into the template

                    question.possibleAnswers.min = parseInt(question.possibleAnswers.min);
                    question.possibleAnswers.max = parseInt(question.possibleAnswers.max);
                    question.submitted = false;
                    question.response_or_default = (question.possibleAnswers.min + ((question.possibleAnswers.max - question.possibleAnswers.min) / 2));

                    // expand answers into objects to store information about responses
                    for (i = 0; i < numAnswers; i += 1 ){
                        answer = question.possibleAnswers[i];
                        question.possibleAnswers[i] = {
                            value: answer
                        };
                    }

                    // determine if the question has been answered already
                    for (i = 0; i < l; i += 1) {
                        response = question.responses[i];
                        if (response.userID === uuid) {
                            question.submitted = true;
                            // insert a response flag into the answer selected
                            if (question.type === 'mc') {
                                k = response.value.length;
                                // response.value is a list of numbers
                                console.log(question.possibleAnswers);
                                for (j = 0; j < k; j += 1) {
                                    question.possibleAnswers[parseInt(response.value[j])].isResponse = true;
                                }
                                console.log(question.possibleAnswers);
                            } else if (question.type === 'emc') {
                                // response.value is a single number
                                question.possibleAnswers[parseInt(response.value)].isResponse = true;
                            } else if (question.type === 'num') {
                                // response.value is a number
                                question.response_or_default = parseInt(response.value);
                            }
                        }
                    }
                    console.log(question.possibleAnswers);
                    question_content = new Ractive({
                        el: 'question',
                        template: '#questionTemplate',
                        data: {
                            question: question,
                            status: "",
                            formatDate: formatDate
                        }
                    });

                    // re-render the jquery mobile page
                    $('div#questionPage').trigger('create');


                    bindLocationButton();
                    $('button#submit-question').click(submitQuestionAJAX);
                },
                error: function (error) {
                    question_content.set('status', 'Error: ' + JSON.stringify(error));
                }
            })
        },
        bindLocationButton = function () {
            var $location_button = $('button#locationButton'),
                loc_fail = function () {
                    if (!has_location) {
                        $location_button.removeClass('ui-icon-clock').addClass('ui-icon-info').removeAttr('disabled').text('Location failed (tap to retry)');
                    }
                },
                has_location = false;




            if ('geolocation' in navigator) {
                $location_button.click(function () {
                    $location_button.removeClass('ui-icon-location').addClass('ui-icon-clock').text('Getting location...');
                    // wait 5 seconds before dropping location search
                    window.setTimeout(loc_fail,5000);

                    navigator.geolocation.getCurrentPosition(function (pos) {
                            has_location = true;
                            $('input#loc_latitude').val(pos.coords.latitude);
                            $('input#loc_longitude').val(pos.coords.longitude);
                            $location_button.removeClass('ui-icon-clock').addClass('ui-icon-check').text('Location confirmed').attr('disabled', '');
                        },
                        loc_fail);
                    return false;
                });
            } else {
                $location_button.attr('disabled','').text('Location Service Unavailable');
            }

        },
        createUser = function () {
            $('body').pagecontainer('change', '#userCreatePage');

            registerGCM();

        },
        // reactive mood history updating
        mood_history = new Ractive({
            el: 'moodHistory',
            template: '#moodHistoryTemplate',
            data: {
                moods: [],
                status: "",
                formatTime: formatTime
            }
        }),
        registerGCM = function () {
            var successHandler = function (result) {
                    console.log(result);
                },
                errorHandler = function (error) {
                    console.log(error);
                    toast.showLongBottom(error);
                };

            console.log('pinging GCM...');

            if (device.platform === 'android' || device.platform === 'Android') {
                pushNotification.register(
                    successHandler,
                    errorHandler,
                    {
                        "senderID": "676761242212",
                        "ecb": "onNotification"
                    }
                );
            } // ignore iOS for now, but leave option open for support in the future


        },
        unregisterGCM = function () {
            // TODO: GCM does not guarantee registration IDs will last forever; integrate this
            var successHandler = function (result) {
                console.log(result);
            },
            errorHandler = function (error) {
                alert('ERROR: Could not establish a connection with GCM.  You will not receive push notifications.' + error)
            };

            regid = null;
            storage.removeItem('regid');

            pushNotification.unregister(successHandler, errorHandler, {
                "senderID": "676761242212",
                "ecb": "onNotification"
            });
        },
        question_content;


    // bind submit button to the ajax form function
    $('button#moodSubmit').click(submitMoodAJAX);

    // bind app exit event
    $(document).on('pause', function () {
        //unregisterGCM();
    });


    $(document).on('deviceready', function () {

        // enable and configure StatusBar
        StatusBar.overlaysWebView( false );
        StatusBar.backgroundColorByName( "gray" );

        storage = window.localStorage;

        console.log(storage);
        console.log(window.localStorage);
        // find device uuid
        uuid = device.uuid;
        storage.setItem('uuid', uuid);

        //enable pushNotification plugin
        pushNotification = window.plugins.pushNotification;
        toast            = window.plugins.toast;


        // fetch user data
        $.ajax({
            url: config.api + 'users/' + uuid,
            method: 'get',
            success: function (user) {
                // user exists, don't prompt
                userid = user._id;
            },
            error: function (error) {
                // no user exists, prompt to create one (if on android)
                if (device.platform === 'android' || device.platform === 'Android') {
                    createUser();
                }
            }
        });



        // fetch mood history data
        fetchMoodHistory();
        bindLocationButton();

        //report environment
        if (config.env) {
            $('span#environment').text('(' + config.env + ')');
        }


        $('body').on('pagecontainershow', function (event, ui) {
            if ($('body').pagecontainer('getActivePage').data('url') === 'questionPage') {
                generateQuestionPage();
            } else if ($('body').pagecontainer('getActivePage').data('url') === 'userCreatePage') {
                // bind buttons
                $('button#setNotifications').click(function () {
                    console.log('creating user');
                    $.ajax({
                        url: config.api + 'users',
                        method: 'POST',
                        data: {
                            uuid: uuid,
                            notificationTime: $('input#notificationTime').val(),
                            registrationID: regid
                        },
                        complete: function () {
                            $('body').pagecontainer('change', '#mainPage');
                        },
                        success: function () {
                            toast.showLongBottom('Registered successfully');
                        },
                        error: function (error) {
                            console.log(error);
                            toast.showLongBottom('Sorry; An error occurred');
                        }
                    });
                    return false;
                });

                $('button#noNotifications').click(function () {
                    $.ajax({
                        url: config.api + 'users',
                        method: 'POST',
                        data: {
                            uuid: uuid,
                            notificationTime: null,
                            registrationID: regid
                        },
                        complete: function () {
                            $('body').pagecontainer('change', '#mainPage');
                        },
                        success: function () {
                            toast.showLongBottom('Registered successfully');
                        },
                        error: function (error) {
                            console.log(error);
                            toast.showLongBottom('Sorry; An error occurred');
                        }
                    });
                    return false;
                });
            }
        });
    });
}(jQuery));
