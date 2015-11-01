(function(angular) {
	'use strict';


angular.module('viz', [])
/*
    .controller('ListingsController', ['$scope', function($scope, data) {
    	$scope.listings = data;
    }]);
*/

    .controller('ListingsController', function($scope, greeter, user) {
        $scope.greeting = greeter.greet(user.name);
        /*
        $scope.test = function() {
            console.log("here");
            $.ajax({
              type: "GET",
              url: "http://relay-rides-server.herokuapp.com/test/",
              data: {login: "test", grocery: "g"},
              dataType: "text"
            })
            .done(function(response, status) {
                $scope.results = response;
                console.log("SUCCESS");
                console.log(status);
                console.log(response);
            })
            .fail(function(response, status) {
                console.log("ERROR");
                console.log(status);
            });

        };
        */
        console.log("listings controller");
        console.log("$scope.results_xml: " + $scope.results_xml);
        var results = $.parseXML($scope.results_xml);
        $("#results").append(results);

    });
angular.module('xmpl.service', [])

    .value('greeter', {
    	salutation: 'Hello',
    	localize: function(localization) {
      		this.salutation = localization.salutation;
    	},
    	greet: function(name) {
      		return this.salutation + ' ' + name + '!';
    	}
    })

    .value('user', {
    	load: function(name) {
        	this.name = name;
    	}
    })

    .value('request_values', {
        dest: "",
        startdate: "",
        enddate: "",
        pickuptime: "",
        dropofftime: "",
        initialize: function() {
            this.dest = "LAX";
            this.startdate = "10/31/2015";
            this.enddate = "11/10/2015";
            this.pickuptime = "09:30";
            this.dropofftime = "13:00";
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

angular.module('xmpl.directive', []);

angular.module('xmpl.filter', []);

angular.module('main', ['xmpl.service', 'xmpl.directive', 'xmpl.filter', 'viz'])

    .run(function(greeter, user, request_values) {
    // This is effectively part of the main method initialization code
    	greeter.localize({
        	salutation: 'Bonjour'
    	});
    	user.load('World');
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
        


/*
        var picker = new Pikaday({
            field: $('#datepicker')[0],
            firstDay: 1,
            minDate: new Date(2000, 0, 1),
            maxDate: new Date(2020, 12, 31),
            yearRange: [2000, 2020],
            onSelect: function(date) {
                console.log($('#datepicker').val());
                picker.setStartRange();
            }
        });
*/
    })

    .controller('InputController', function($scope, greeter, user, request_values) {
    	var handleErrors = function(errors) {
            console.log("handleErrors");
            console.log("errors:");
            console.log(errors);
            var error;
            var errorCode;
            for (var i = 0; i < errors.length; i++) {
                console.log(errors[i]);
                error = errors[i].Error;
                console.log(error.length);
                for (var j = 0; j < error.length; j++) {
                    errorCode = error[j].ErrorCode;
                    console.log(errorCode);
                    console.log(errorCode.length);
                    for (var k = 0; k < errorCode.length; k++) {
                        console.log(errorCode[k]);
                        if (errorCode[k] == "102025") {
                            alert(error[j].ErrorMessage[k]);
                        }
                    }
                }
            }
        }

        $scope.location = "";
        $scope.greeting = greeter.greet(user.name);
        // $scope.request_info = {
        //     dest: "LAX",
        //     startdate:   "11/01/2015",
        //     enddate:     "11/10/2015",
        //     pickuptime:  "09:30",
        //     dropofftime: "13:00"
        // };
        $scope.getResults = function() {
            if (request_values.startdate <= request_values.enddate) {
                request_values.set({
                    dest: $scope.location
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
                    var errors = response.Errors;
                    console.log(response);
                    console.log(errors);
                    if (errors[0] == "") {
                        $scope.results = response.Result[0].CarResult;
                        $scope.$evalAsync();
                        console.log("$scope.results: ");
                        console.log($scope.results);
                        console.log($scope.results[0].PickupDay + ", " + $scope.results[0].DropoffDay);
                    } else {
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



    });

})(window.angular);


