"use strict"

app.service('mainService', ['$routeParams', '$mdMedia', '$mdDialog', '$mdToast', "$http", "$interval", 'leafletData', "$location", function($routeParams, $mdMedia, $mdDialog, $mdToast, $http, $interval, leafletData, $location) {

	// Alias for the module
	var serv = this;

	// Client information
	serv.me = {
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

	// Util:  notification 
	serv.openToast = function(message, position) {
		var toastMessage = (message === undefined) ? "no toast message" : message;
		var messagePosition = (position === undefined) ? "top right" : position;
		$mdToast.show($mdToast.simple().content(toastMessage).position(messagePosition));
	};

	// Calculate distance between two coordinates and returns result in miles
	serv.greatCircleMethod = function(destLat, destLng, clientLat, clientLng) {
		// Catch Errors , if zero will throw error but function will still run
		console.assert(destLat || destLng || clientLat || clientLng, "greatCircleMethod: Missing Parameters");
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

	serv.updateDistFromUsers = function() {
		for (var prop2 in serv.users) {
			// shorter alias
			var user = serv.users[prop2];
			console.assert(serv.me.lat && serv.me.lng, "serv.me.lat  serv.me.lng are " + serv.me.lng);
			user.apart = serv.greatCircleMethod(user.lat, user.lon, serv.me.lat, serv.me.lng);
		}
	};

	// my location
	serv.mapCenter = {
		lat: null,
		lng: null,
		zoom: null
	};
	serv.setMapCenter = function(lat, lng, zoom) {
		serv.mapCenter = {
			lat: lat,
			lng: lng,
			zoom: zoom
		};
	};
	serv.getMapCenter = function() {
		return serv.mapCenter;
	};

	serv.location = serv.mapCenter;

	serv.updateMeLocation = function(location) {
		serv.me.lat = location.latitude;
		serv.me.lng = location.longitude;
	};

	// I need This in case user denies permission to share location
	serv.getIpLocation = function(callback) {
		// Get Client IP and store into result
		$http.get('http://ipv4.myexternalip.com/json').then(function(result) {
			// use result and to get City level accurate location
			$http.get("http://freegeoip.net/json/" + result.data.ip).then(function(returnData) {
				serv.openToast("Semi Location Updated", "bottom right");
				// invoke callback and pass in returnData.data
				if (callback) {
					callback(returnData.data);
				} else {
					// if no callback update serv.me
					// console.log(returnData.data);
					if (!serv.me.lat) {
						serv.updateMeLocation(returnData.data);
						serv.updateDistFromUsers();
					}
				}
			});
		}, function(e) {
			console.log("couldn't get Ip Address", e);
		});
	};



	serv.watchPosition = function(objectUpdate) {
		navigator.geolocation.watchPosition(function(gps) {
			// console.log(serv.mapCenter);
			serv.openToast("Full Location Updated", "bottom right");
			serv.updateMeLocation(gps.coords);
			serv.updateDistFromUsers();
			serv.setMapCenter(gps.coords.latitude,gps.coords.longitude,10);
			var myLocation = {
				accuracy: gps.coords.accuracy,
				lat: gps.coords.latitude,
				lon: gps.coords.longitude,
				timeStamp: Date.now(),
			};
			// send location to server
			serv.locationEmit(myLocation);
		});
	};



	// Start socket
	serv.socket = io();

	// Update me once logged in
	serv.socket.on('apiMe', function(apiMe) {
		if (apiMe.lng) {
			apiMe.lng = apiMe.lon;
		}
		// serv.me = apiMe;
	});

	// Delivery Request Array 
	serv.allRequests = [];

	//  incoming request 
	serv.socket.on('allRequests', function(data) { // bug: when you log in data is an empty {}
		serv.openToast("New Request In", "top right");
		serv.allRequests = data;
	});

	serv.locationEmit = function(myLocation) {
		serv.socket.emit("myLocation", myLocation);
	};

	serv.socket.on('allUsers', function(data) {
		serv.openToast("New Users", "bottom left");
		serv.users = data;
		serv.updateDistFromUsers();
	});

	// ================================== Here I trigger methods from serv ================================== \\ 
	serv.watchPosition();

	serv.getIpLocation();
}]);