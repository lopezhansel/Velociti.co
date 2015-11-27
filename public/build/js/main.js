'use strict';

var app = angular.module('StarterApp', ['ngAnimate', 'ngMaterial', 'ngRoute', 'leaflet-directive']);

//Velocity Colors #61CBE9 // #F5EAE2 // #F36F36
//http://mcg.mbitson.com/#/
//http://angular-md-color.com/#/
app.config(function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('myBlue', {
        '50': 'ffebee',
        '100': 'ffcdd2',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f36f36',
        '600': 'e53935',
        '700': 'd32f2f',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a80',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
        'contrastLightColors': undefined // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default').primaryPalette('myBlue');
});

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('myOrange', {
        '50': 'ffebee',
        '100': 'ffcdd2',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f36f36',
        '600': 'e53935',
        '700': 'd32f2f',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a80',
        'A200': '61CBE9',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
        'contrastLightColors': undefined // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default').accentPalette('myOrange');
});

app.filter('orderObjectBy', function () {
    return function (items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return a[field] > b[field] ? 1 : -1;
        });
        if (reverse) filtered.reverse();
        return filtered;
    };
});

app.config(function ($routeProvider) {
    $routeProvider.when('/home', {
        controller: 'mainController',
        templateUrl: 'views/homeView.html'
    }).when('/map', {
        controller: 'mapController',
        templateUrl: 'views/mapView.html'
    }).when('/requests', {
        controller: 'requestsController',
        templateUrl: 'views/requestsView.html'
    }).when('/ProfileView/:id', {
        controller: 'mainController',
        templateUrl: 'views/ProfileView.html'
    }).when('/profile', {
        controller: 'profileController',
        templateUrl: 'views/profileView.html'
    }).when('/login', {
        controller: 'mainController',
        templateUrl: 'views/loginView.html'
    }).otherwise({
        redirectTo: '/home'
    });
});