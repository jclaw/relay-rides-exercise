(function(angular) {
	'use strict';
 
/*
angular.module('modal.service', [])
    .value('modal', {
        header: "test header",
        body: "test body",
        footer: "test footer",
        set: function(content) {
            if (content.header) this.header = content.header;
            if (content.body) this.body = content.body;
            if (content.footer) this.footer = content.footer;
        },
        get: function() {
            return {
                header: this.header,
                body: this.body,
                footer: this.footer
            };
        }
    });
*/
angular.module('main.service', [])

    .value('request_values', {
        dest: "",
        startdate: "",
        enddate: "",
        pickuptime: "12:00pm",
        dropofftime: "12:00pm",
        initialize: function() {
            var d1 = new Date(), d2 = new Date();
            d1.setDate(d1.getDate() + 1);
            d2.setDate(d1.getDate() + 2);
            this.dest = "LAX";
            this.startdate = d1.format("MM/dd/yyyy");
            this.enddate = d2.format("MM/dd/yyyy");
            this.pickuptime = "12:00pm";
            this.dropofftime = "12:00pm";
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

angular.module('main', ['main.service', 'main.directive', 'main.filter'/*, 'viz'*/])

    .run(function(request_values) {
    // This is effectively part of the main method initialization code
        request_values.initialize();
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
                maxDate: new Date(2020, 12, 31),
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
                maxDate: new Date(2020, 12, 31),
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

    .controller('InputController', function($scope, request_values /*, modal*/) {
    	var handleErrors = function(errors) {
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

        var parseResults = function(response) {
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

        var leadingZero = function(num) {
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
                     
        var generateTimes = function() {
            var times = [];
            var hour_divisions = 2;
            var starting_hour = 9;
            var ending_hour = 18;
            var str;
            var minutes;
            var i = 0;

            for (var hours = starting_hour; hours < ending_hour; hours++) {
                for (var j = 0; j < hour_divisions; j++) {

                    minutes = leadingZero(j * 60 / hour_divisions);
                    str = leadingZero(hours) + ":" + minutes;
                    times[i] = time_mil_to_std(str);
                    i++;
                }
            }
            console.log(times);
            return times;
        }                                

        $scope.loc = "";
        $scope.times = generateTimes();
        $scope.pickuptime = request_values.get().pickuptime;
        $scope.dropofftime = request_values.get().dropofftime;

        $scope.getResults = function() {
            console.log($scope.loc);
            if (request_values.startdate <= request_values.enddate) {
                request_values.set({
                    dest: $scope.loc,
                    pickuptime: time_std_to_mil($scope.pickuptime),
                    dropofftime: time_std_to_mil($scope.dropofftime)
                });
                console.log(request_values.get());
                

                $.ajax({
                    type: 'POST',
                    url: 'http://relay-rides-server.herokuapp.com/getResults/',
                    data: request_values.get(),
                    dataType: "text"
                })
                .done(function(data, status) {
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
                        $scope.results = parseResults(response);
                        $scope.$evalAsync();
                        console.log("$scope.results: ");
                        console.log($scope.results);
                        console.log($scope.results[0].result.PickupDay + ", " + $scope.results[0].result.DropoffDay);
                    } else {
                        console.log("error from api");
                        handleErrors(errors);
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

        $scope.getSelectedTime = function(name, index) {
            if (name == "start") {
                $scope.pickuptime = $scope.times[index];
                $("#start_dropdown > button").html($scope.pickuptime + ' <span class="caret"></span>');
            }
        }

        $scope.displayModal = function(index) {
            console.log('here');
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
/*
angular.module('viz', ['modal.service'])

    .controller('ListingsController', function($scope, modal) {


    });

angular.module('modal', ['modal.service'])
    .controller('ModalController', function($scope, modal) {

    }); 
*/


})(window.angular);


