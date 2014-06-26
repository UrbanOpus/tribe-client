/**
 * Created by faide on 2014-06-23.
 */


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
    var userid = null,

    // reactive mood history updating
        mood_history = new Ractive({
            el: 'moodHistory',
            template: '#moodHistoryTemplate',
            data: {
                moods: [],
                status: "",
                formatTime: function (datetime) {
                    var date    = new Date(Date.parse(datetime)),
                        day     = date.getDate(),
                        month   = date.getMonth(),
                        year    = date.getFullYear(),
                        hour    = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours(),
                        minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();

                    return day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
                }
            }
        }),

    // AJAX form submission
        submitFormAJAX = function () {
            if (userid === null) {
                mood_history.set('status', 'Error: could not find device id, or device not ready yet.');
                return;
            }
            var $form = $('form#moodForm'),
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
                url: config.api + 'moods/users/' + userid,
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
        };


    // bind submit button to the ajax form function
    $('button#moodSubmit').click(submitFormAJAX);


    $(document).on('deviceready', function () {
        var $location_button = $('button#locationButton'),
            loc_fail,
            has_location = false;

        // enable and configure StatusBar
        StatusBar.overlaysWebView( false );
        StatusBar.backgroundColorByName( "gray" );

        // find device uuid
        userid = device.uuid;

        // fetch mood history data
        $.ajax({
            url: config.api + 'moods/users/' + userid,
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

        //report environment
        if (config.env) {
            $('span#environment').text('(' + config.env + ')');
        }

        loc_fail = function () {
            if (!has_location) {
                $location_button.removeClass('ui-icon-clock').addClass('ui-icon-info').removeAttr('disabled').text('Location failed (tap to retry)');
            }
        };

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

    });
}(jQuery));
