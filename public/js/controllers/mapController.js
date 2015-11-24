app.controller('mapController', ['$scope', 'mainService', '$routeParams', '$mdMedia', '$mdDialog', '$mdToast', "$http", "$interval", 'leafletData', "$location", "$timeout", function($scope, mainService, $routeParams, $mdMedia, $mdDialog, $mdToast, $http, $interval, leafletData, $location, $timeout) {
	if (mainService.me=== "there"){ $location.path("/login");} 
	else{
		
		if (mainService.users){
			$timeout(function() {
				$scope.mapMarkerss = userLocToMarkers(mainService.users);
			}, 500);
		}
	}

	$scope.mapCenter = mainService.getMapCenter();

	$timeout(function() {
		if (mainService.location) {
			leafletData.getMap().then(function(map) {
				setTimeout(function() {
					map.invalidateSize(); // this fixes Map render Bug
				}, 200);
			}); ////leafletData.getMap().then(function(map) {

			$scope.mapCenter = mainService.location;

			$scope.$digest();
		} else {
			leafletData.getMap().then(function(map) {
				setTimeout(function() {
					map.invalidateSize(); // this fixes Map render Bug
				}, 200);
			}); ////leafletData.getMap().then(function(map) {
			$timeout(function() {
				if (mainService.location) {
					$scope.mapCenter = mainService.location;
					$scope.$digest();


				}
			}, 5000);
		}
	}, 1000);


}]);