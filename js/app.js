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
    });

angular.module('xmpl.directive', []);

angular.module('xmpl.filter', []);

angular.module('main', ['xmpl.service', 'xmpl.directive', 'xmpl.filter', 'viz'])

    .run(function(greeter, user) {
    // This is effectively part of the main method initialization code
    	greeter.localize({
        	salutation: 'Bonjour'
    	});
    	user.load('World');

        var startDate,
            endDate,
            updateStartDate = function() {
                startPicker.setStartRange(startDate);
                endPicker.setStartRange(startDate);
                endPicker.setMinDate(startDate);
                console.log(startDate);
                console.log(startDate.toDateString());
                console.log(startDate.getDate());
                var d = startDate.format("MM/dd/yyyy");
                console.log(d);
                //$scope.request_info.startdate;
            },
            updateEndDate = function() {
                startPicker.setEndRange(endDate);
                startPicker.setMaxDate(endDate);
                endPicker.setEndRange(endDate);
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

    .controller('InputController', function($scope, greeter, user) {
    	$scope.greeting = greeter.greet(user.name);
        $scope.request_info = {
            dest: "LAX",
            startdate:   "11/01/2015",
            enddate:     "11/10/2015",
            pickuptime:  "09:30",
            dropofftime: "13:00"
        };
        $scope.getResults = function() {
            $.ajax({
                type: 'POST',
                url: 'http://relay-rides-server.herokuapp.com/getResults/',
                data: $scope.request_info,
                dataType: "text"
            })
            .done(function(data, status) {
                $scope.results = data;
                console.log("SUCCESS");
                console.log(status);
                var json = $.parseJSON(data);
                var response = json.Hotwire;
                //console.log(response);
                $scope.results = response.Result[0].CarResult;
                $scope.$evalAsync();
                console.log("$scope.results: ");
                console.log($scope.results);




            })
            .fail(function(response, status) {
                console.log("ERROR");
                console.log(status);
            });

        };

    });

})(window.angular);


