(function(angular) {
	'use strict';


angular.module('viz', [])
    .controller('ListingsController', ['$scope', function($scope, data) {
    	$scope.listings = data;
    }]);

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

    .controller('InputController', function($scope, $http, greeter, user) {
    	$scope.greeting = greeter.greet(user.name);
        $scope.getResults = function(item) {
            
/*
            var request = url + "apikey=" + key + "&dest=" + dest + "&startdate=" + startdate + "&enddate=" +
                          enddate + "&pickuptime=" + pickuptime + "&dropofftime=" + dropofftime;
*/            
            var req = {
                method: 'GET',
                url: 'http://relay-rides-server.herokuapp.com/getResults/',
                data: {
                    dest:        "LAX",
                    startdate:   "11/01/2015",
                    enddate:     "11/10/2015",
                    pickuptime:  "09:30",
                    dropofftime: "13:00"
                },
                dataType: "text"
            };

            $http(req).then(function successCallback(response) {
                $scope.results = data;
                console.log("SUCCESS");
                console.log(status);
                console.log(data);
            }, function errorCallback(response) {
                console.log("ERROR");
                console.log(status);
            });


        }
        $scope.requestinfo = {
            dest: "LAX",
            startdate: "11/01/2015",
            enddate: "11/28/2015",
            pickuptime: "9:30",
            dropofftime: "13:30"
        };

    });

})(window.angular);
