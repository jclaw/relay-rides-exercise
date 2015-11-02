(function(angular) {
	'use strict';
 
angular.module('main.service', [])

    .value('request_values', {
        dest: "",
        startdate: "",
        enddate: "",
        pickuptime: "12:00",
        dropofftime: "12:00",
        initialize: function() {
            var d1 = new Date(), d2 = new Date();
            d1.setDate(d1.getDate() + 1);
            d2.setDate(d1.getDate() + 2);
            this.dest = "LAX";
            this.startdate = d1.format("MM/dd/yyyy");
            this.enddate = d2.format("MM/dd/yyyy");
            this.pickuptime = "12:00";
            this.dropofftime = "12:00";
        },
        set: function(req) {
            if (req.dest) this.dest = req.dest;
            if (req.startdate) this.startdate = req.startdate;
            if (req.enddate) this.enddate = req.enddate;
            if (req.pickuptime) this.pickuptime = req.pickuptime;
            if (req.dropofftime) this.dropofftime = req.dropofftime;
        },
        get: function() {
            return {
                dest: this.dest,
                startdate: this.startdate,
                enddate: this.enddate,
                pickuptime: this.pickuptime,
                dropofftime: this.dropofftime
            };
        }

    });

angular.module('main.directive', []);

angular.module('main.filter', []);

angular.module('main', ['main.service', 'main.directive', 'main.filter'])

    .run(function(request_values) {
    // This is effectively part of the main method initialization code

    // these declarations are mostly from dbushell's Pikaday date-range.html example
        var startDate,
            endDate,
            updateStartDate = function() {
                startPicker.setStartRange(startDate);
                endPicker.setStartRange(startDate);
                endPicker.setMinDate(startDate);
                request_values.set({
                    startdate: startDate.format("MM/dd/yyyy")
                });
                console.log(request_values.get());
            },
            updateEndDate = function() {
                startPicker.setEndRange(endDate);
                startPicker.setMaxDate(endDate);
                endPicker.setEndRange(endDate);

                request_values.set({
                    enddate: endDate.format("MM/dd/yyyy")
                });
                console.log(request_values.get());
            },
            startPicker = new Pikaday({
                field: document.getElementById('start'),
                minDate: new Date(),
                maxDate: (new Date()).setFullYear(new Date().getFullYear() + 5, 12, 31),
                onSelect: function() {
                    startDate = this.getDate();
                    console.log("startDate");
                    console.log(startDate);
                    console.log(startDate.getMonth());
                    endPicker.gotoMonth(startDate.getMonth());
                    updateStartDate();
                }
            }),
            endPicker = new Pikaday({
                field: document.getElementById('end'),
                minDate: new Date(),
                maxDate: (new Date()).setFullYear(new Date().getFullYear() + 5, 12, 31),
                onSelect: function() {
                    endDate = this.getDate();
                    updateEndDate();
                }
            }),
            _startDate = startPicker.getDate(),
            _endDate = endPicker.getDate();

            if (_startDate) {
                startDate = _startDate;
                updateStartDate();
            }

            if (_endDate) {
                endDate = _endDate;
                updateEndDate();
            }
    })

    .controller('InputController', function($scope, request_values) {
    	var handle_errors = function(errors) {
            var error;
            var errorCode;
            for (var i = 0; i < errors.length; i++) {
                error = errors[i].Error;
                for (var j = 0; j < error.length; j++) {
                    errorCode = error[j].ErrorCode;
                    for (var k = 0; k < errorCode.length; k++) {
                        alert(error[j].ErrorMessage[k]);
                    }
                }
            }
        }

        var parse_results = function(response) {
            var metadata = response.MetaData[0].CarMetaData[0].CarTypes[0].CarType;
            var results = response.Result[0].CarResult;
            var output = [{}];
            var obj;
            for (var i in results) {
                for (var j in metadata) {
                    if (results[i].CarTypeCode[0] == metadata[j].CarTypeCode[0]) {
                        output[i] = { result: results[i], metadata: metadata[j] };
                        break;
                    }
                }   
            }
            return output;
        }

        var leading_zero = function(num) {
            if (num < 10) return "0" + num;
            return num.toString();
        }



        var time_mil_to_std = function(time) {
            var timesplit = time.split(":");
            var output;

            if (timesplit[0].charAt(0) == "0") {
                timesplit[0] = timesplit[0].charAt(1);
            }
            if (timesplit[0] > 12) {
                output = timesplit[0] - 12 + ":" + timesplit[1] + "pm";
            } else if (timesplit[0] == 12) {
                output = timesplit[0] + ":" + timesplit[1] + "pm";
            } else {
                output = timesplit[0] + ":" + timesplit[1] + "am";
            }
            return output;
        }

        var time_std_to_mil = function(time) {
            var timesplit = time.split(":");
            
            var suffix = timesplit[1].substring(2, 4);
            timesplit[1] = timesplit[1].substring(0, 2);

            if (suffix == "pm" && timesplit[0] != "12") {
                timesplit[0] = Number(timesplit[0]) + 12;
            }

            return timesplit[0] + ":" + timesplit[1];
        }
                     
        var generate_times = function() {
            var times = [];
            var hour_divisions = 2;
            var starting_hour = 9;
            var ending_hour = 18;
            var str;
            var minutes;
            var i = 0;

            for (var hours = starting_hour; hours < ending_hour; hours++) {
                for (var j = 0; j < hour_divisions; j++) {

                    minutes = leading_zero(j * 60 / hour_divisions);
                    str = leading_zero(hours) + ":" + minutes;
                    times[i] = time_mil_to_std(str);
                    i++;
                }
            }
            console.log(times);
            return times;
        }                                

        $scope.loc = "";
        $scope.times = generate_times();
        $scope.pickuptime = request_values.get().pickuptime;
        $scope.dropofftime = request_values.get().dropofftime;

        $scope.get_results = function() {
            console.log($scope.loc);
            if (request_values.startdate <= request_values.enddate) {
                request_values.set({
                    dest: $scope.loc,
                    pickuptime: $scope.pickuptime,
                    dropofftime: $scope.dropofftime
                });
                console.log(request_values.get());
                

                $("#search").text("Loading...");
                $.ajax({
                    type: 'POST',
                    url: 'http://relay-rides-server.herokuapp.com/getResults/',
                    data: request_values.get(),
                    dataType: "text"
                })
                .done(function(data, status) {
                    
                    $("#search").text("Search");
                    $scope.results = data;
                    console.log("SUCCESS");
                    console.log(status);
                    var json = $.parseJSON(data);
                    var response = json.Hotwire;

                    // var response = sampledata;
                    var errors = response.Errors;
                    console.log(response);
                    console.log(errors);
                    if (errors[0] == "") {
                        $scope.results = parse_results(response);
                        $scope.$evalAsync();
                        console.log("$scope.results: ");
                        console.log($scope.results);
                        console.log($scope.results[0].result.PickupDay + ", " + $scope.results[0].result.DropoffDay);
                    } else {
                        console.log("error from api");
                        handle_errors(errors);
                    }
                    
            
                })
                .fail(function(response, status) {
                    console.log("ERROR");
                    console.log(status);
                });
            

            } else {
                alert("Please enter valid dates!");
                console.log(request_values.get());
            }

        };

        $scope.get_selected_time = function(name, index) {
            if (name == "start") {
                $scope.pickuptime = time_std_to_mil($scope.times[index]);
                $("#start_dropdown > button").html($scope.times[index] + ' <span class="caret"></span>');
            } else if (name == "end") {
                $scope.dropofftime = time_std_to_mil($scope.times[index]);
                $("#end_dropdown > button").html($scope.times[index] + ' <span class="caret"></span>');
            }
        }

        $scope.display_modal = function(index) {
            var modal = $("#resultModal");
            var title = modal.find('#m-title');
            var subtitle = modal.find('#m-subtitle');
            var price = modal.find('#m-price');
            var body = modal.find('#m-body');


            var metadata = $scope.results[index].metadata;
            var result = $scope.results[index].result;
            title.text(metadata.CarTypeName[0] + " Car");
            subtitle.text((metadata.PossibleModels[0]).toUpperCase());
            price.text("$" + result.DailyRate[0]);

            var bodystr = "<p><strong>Pickup Location: </strong>" + result.LocationDescription[0] + "</p>" + 
                          "<p><strong>Pickup Day: </strong>" + result.PickupDay[0] + 
                          "<strong> at: </strong>" + time_mil_to_std(result.PickupTime[0]) + "</p>" + 
                          "<p><strong>Dropoff Day: </strong>" + result.DropoffDay[0] + 
                          "<strong> at: </strong>" + time_mil_to_std(result.DropoffTime[0]) + "</p>" + 
                          "<p>Click <a href='" + result.DeepLink[0] + "'>here</a> for more info.</p>";

            body.html(bodystr);
            modal.modal();
        }

    });


})(window.angular);


