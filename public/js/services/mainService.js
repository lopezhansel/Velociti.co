app.service('mainService', ['$routeParams', '$mdMedia', '$mdDialog', '$mdToast', "$http", "$interval", 'leafletData', "$location", function($routeParams, $mdMedia, $mdDialog, $mdToast, $http, $interval, leafletData, $location) {
	
	var $service = this;
	
	// Client info 
	$service.me = {
		firstName: null,
		lastName: null,
		id: null,
		lat: 0,
		accuracy: null,
		lng: 0,
		isLoggedIn: null,
		zoom: null,
		timeStamp: null,
	};

	$service.greatCircleMethod = function(destLat, destLng, clientLat, clientLng) {
		var earthMedianRadius = (6371 / 1.609344); //Convert Kilometers to Miles 
		var φ1 = clientLat.toRad();
		var φ2 = destLat.toRad();
		var Δφ = (destLat - clientLat).toRad();
		var Δλ = (destLng - clientLng).toRad();
		var arc = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		var c = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
		var distance = (earthMedianRadius * c);
		return distance;
	};

	// Start socket
	$service.socket = io();

	// Util:  notification 
	$service.openToast = function(message, position) {
		var messagePosition = (position === undefined) ? "top right" : position;
		$mdToast.show($mdToast.simple().content(message).position(messagePosition));
	};


	// Update me once logged in
	$service.socket.on('apiMe', function(apiMe) {
		apiMe.lng = apiMe.lon
		$service.me = apiMe;
	});

	// Delivery Request Array 
	$service.allRequests = [];

	//  incoming request 
	$service.socket.on('allRequests', function(data) {
		if (data) {
			console.log("data in", data);
		}
		$service.openToast("New Request In", "top right");
		$service.allRequests = data;
	});

	// my location
	$service.mapCenter = undefined;
	$service.location = $service.mapCenter;



	$service.getIpLocation = function(callback) {
		// Get Client IP and store into result
		$http.get('http://ipv4.myexternalip.com/json').then(function(result) {
			// use result and to get City level accurate location
			$http.get("http://freegeoip.net/json/" + result.data.ip).then(function(returnData) {
				// invoke callback with returnData.data
				if (callback) {
					$service.openToast("Semi Location Updated", "bottom right");
					callback(returnData.data);
				} else {
					// if no callback updated $service.me
					$service.openToast("Semi Location Updated", "bottom right");
					$service.me.lat = returnData.data.latitude;
					$service.me.lng = returnData.data.longitude;
					for (var prop2 in $service.users) {
						$service.users[prop2].apart = $service.greatCircleMethod($service.users[prop2].lat, $service.users[prop2].lon, $service.me.lat, $service.me.lng);
					}
				}
			});
		}, function(e) {
			console.log("couldn't get Ip Address", e);
		});
	};

	$service.getIpLocation(false);





	$service.locationEmit = function(myLocation) {
		$service.socket.emit("myLocation", myLocation);
	};

	$service.watchPosition = function(objectUpdate) {

		navigator.geolocation.watchPosition(function(currentPosition) {
			$service.openToast("Full Location Updated", "bottom right");
			$service.me.lat = currentPosition.coords.latitude;
			$service.me.lng = currentPosition.coords.longitude;

			$service.mapCenter = {
				lat: currentPosition.coords.latitude,
				lng: currentPosition.coords.longitude,
				zoom: 10
			};

			myLocation = {
				accuracy: currentPosition.coords.accuracy,
				lat: currentPosition.coords.latitude,
				lon: currentPosition.coords.longitude,
				timeStamp: Date.now(),
			};
			$service.locationEmit(myLocation);
		});
	};

	$service.watchPosition();


	$service.socket.on('allUsers', function(data) {
		$service.openToast("New Users", "bottom left");
		$service.users = data;
		for (var prop2 in $service.users) {
			$service.users[prop2].apart = $service.greatCircleMethod($service.users[prop2].lat, $service.users[prop2].lon, $service.me.lat, $service.me.lng);
		}
	});



}]);