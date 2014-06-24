/**
 * Created by faide on 2014-06-23.
 */
(function ($) {
    $(document).on('deviceready', function () {


        /**
         * we use the device's uuid to identify a user when they use the app;
         * this is unique enough for us:
         *  - on iOS, uuid is a guaranteed unique value
         *  - on Android, uuid is a random 64-bit integer
         *
         * Limitations of using uuid:
         *  - Can be spoofed
         *  - Users who switch phones will not be able to retrieve their old data
         */
        var userid = device.uuid;


        // enable and configure StatusBar
        StatusBar.overlaysWebView( false );
        StatusBar.backgroundColorByName( "gray" );

        //fetch questions test
        $.ajax({
            url: config.api + 'questions/',
            success: function (data) {
                $('span#status').text(JSON.stringify(data));
            }
        });

        $('button#moodSubmit').click(function () {


            var $form = $('form#moodForm'),
                raw_data = $form.serializeArray(),
                post_data = {},
                i,
                num = raw_data.length;

            /**
             * jQuery serializes form data as an array of tuples, we need to massage
             *  this array into a JSON object
             */

            for (i = 0; i < num; i += 1) {
                post_data[raw_data[i].name] = raw_data[i].value;
            }

            console.log('post data', post_data);
            console.log('raw data', raw_data);


            $.ajax({
                data: post_data,
                url: config.api + 'moods/' + userid,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    $('span#formStatus').text('Submission successful');
                },
                error: function (error) {
                    $('span#formStatus').text('Error: ' + JSON.stringify(error));
                }
            });


            // prevent default form submission
            return false;
        });

    });
}(jQuery));
