/**
 * Created by faide on 2014-07-14.
 */
angular.module('tribe.home', ['nvd3'])

    .controller('HomeCtrl', function($scope, APIService, UserService) {

        $scope.qotd = {
            title: "",
            config: {
            },
            options: {
                chart: {
                    type: 'pieChart',
                    height: 250,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: true,
                    transitionDuration: 500,
                    labelThreshold: 0.01,
                    legend: {
                        margin: {
                            top: 5,
                            right: 0,
                            bottom: 0,
                            left: 0
                        }
                    }
                }
            },
            data: [],
            events: {
                qotdChart: function (e, scope) {
                    scope.api.refresh();
                }
            },
            answered: false
        };

        $scope.data = {};
        $scope.data.timeline = {
            days: []
        };
        APIService.getQuestion(new Date()).success(function (question) {

            if (question) {

                $scope.qotd.title = question.content;

                // copied directly from the API's sortResponses command
                var sortedResponses = {},
                    responses = question.responses,
                    l = question.possibleAnswers.length || parseInt(question.possibleAnswers.max + 1) - parseInt(question.possibleAnswers.min),
                    i, j, r;

                for (i = 0; i < l; i += 1) {
                    if (responses[i].userID === UserService.get('uuid')) {
                        $scope.qotd.answered = true;
                    }
                    if (question.type === 'num') {
                        sortedResponses[i] = [];
                        for (j = 0; j < responses.length; j += 1) {
                            if (responses[j].value == i) {
                                sortedResponses[i].push(responses[j]);
                            }
                        }
                    } else {
                        sortedResponses[question.possibleAnswers[i]] = [];
                        for (j = 0; j < responses.length; j += 1) {
                            // we can't remove responses once we've counted them; we have to account for non-exclusive multiple choice answers
                            if (((typeof responses[j].value === 'string') && question.possibleAnswers[i] == responses[j].value) || // type-coerce the string into a number for the comparison
                                (typeof responses[j].value !== 'string' &&(responses[j].value.length && responses[j].value[i]))) {
                                sortedResponses[question.possibleAnswers[i]].push(responses[j]);
                            }
                        }
                    }
                }

                for (r in sortedResponses) {
                    if (sortedResponses.hasOwnProperty(r)) {
                        $scope.qotd.data.push({
                            key: r,
                            y: sortedResponses[r].length
                        });
                    }
                }

                console.log(sortedResponses);
            } else {
                $scope.qotd.title = "No question available";
            }
        });

        APIService.getMoodRange(null, moment().subtract(24, 'hours')).success(function (result) {
            console.log('all moods', result);
            $scope.data.allMoods = result;
            generateTimeline();
        }).error(function (err) {
            console.log(err);
        });


        function generateTimeline() {
            var dayInMilliseconds = 1000 * 60 * 60 * 24,
                dayInPx = 500,
                earliestTime = new Date($scope.data.allMoods[0].createdAt),
                earliestDay  = new Date(earliestTime.getFullYear(), earliestTime.getMonth(), earliestTime.getDate()),
                numDays = ((new Date().getTime() - earliestDay.getTime()) / dayInMilliseconds),
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                i, day;


            for (i = 0; i < numDays; i += 1) {
                day = new Date(earliestDay.getTime() + (i * dayInMilliseconds));
                $scope.data.timeline.days.push({
                    utc: day.getTime(),
                    dateString: months[day.getMonth()] + ' ' + day.getDate()
                });
            }

            $scope.data.timeline.origin  = earliestDay;
            $scope.data.timeline.widthPX = dayInPx;
            $scope.data.timeline.widthMS = dayInMilliseconds;


        }
    });
