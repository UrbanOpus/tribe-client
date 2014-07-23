/**
 * Created by faide on 2014-07-22.
 */
angular.module('tribe.d3', ['nvd3'])
    .controller('D3Controller', function ($scope, APIService, amMoment) {

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
            }
        };
        $scope.mood = {
            title: "All Moods",
            config: {
            },
            options: {
                chart: {
                    type: 'scatterChart',
                    scatter: {
                        onlyCircles: true
                    },
                    height: 150,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 45
                    },
                    clipEdge: true,
                    staggerLabels: true,
                    transitionDuration: 500,
                    showLegend: false,
                    showControls: false,
                    stacked: true,
                    forceX: [],
                    xAxis: {
                        //axisLabel: 'Last 24 Hours',
                        showMin: false,
                        showMax: true,
                        tickFormat: function(d){
                            return d3.time.format('%I:%M %p')(new Date(d));
                        },
                        tickValues: function () {
                            var now = moment().startOf('hour'),
                                i,
                                hours = [];
                            for (i = 0; i < 24; i += 1) {
                                hours.push(now.subtract(i, 'hours'));
                            }
                            console.log(hours);
                            return hours;
                        },
                        min: 0,
                    },
                    yAxis: {
                        axisLabel: 'Happiness',
                        axisLabelDistance: 40,
                        axisRange: [-100,100],
                        tickFormat: function(d){
                            return d3.format(',f')(d);
                        }
                    }
                }
            },
            data: [],
            events: {
                moodChart: function (e, scope) {
                    console.log(scope);
                    scope.api.refresh();
                }
            }
        };

        // populate data

        APIService.getQuestion(new Date()).success(function (question) {

            if (question) {

                $scope.qotd.title = question.content;

                // copied directly from the API's sortResponses command
                var sortedResponses = {},
                    responses = question.responses,
                    l = question.possibleAnswers.length || parseInt(question.possibleAnswers.max + 1) - parseInt(question.possibleAnswers.min),
                    i, j, r;

                for (i = 0; i < l; i += 1) {
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
                $scope.qotd.title = "No question available ";
            }
        });

        APIService.getMoodRange(null, moment().subtract(24, 'hours')).success(function (moods) {
            console.log(moods);
            var i, l = moods.length;
            var allMoods = {
                key: 'All Moods',
                values: []
            };

            var now = new Date().getTime();

            for (i = 0; i < l; i += 1) {
                allMoods.values.push({
                    x: new Date(moods[i].createdAt).getTime(),
                    y: moods[i].value
                });

            }
            $scope.mood.data.push(allMoods);
        }).error(function (err) {
            console.error(err);
        });

        $scope.moodTab = function () {
            console.log('mood tab')
        };

        $scope.qotdTab = function () {
            console.log('qotd tab')
        };

    });