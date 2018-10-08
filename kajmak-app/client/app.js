'use strict';

var app = angular.module("application", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.html",
        controller: "homeCtrl"
    })
    .when("/createKajmak", {
        templateUrl : "createKajmak.html"
    })
    .when("/listKajmak", {
        templateUrl : "listKajmak.html"
    })
    .when("/mixKajmak", {
        templateUrl : "mixKajmak.html"
    });
});

app.controller("homeCtrl", function($scope) {
    $scope.start = function() {
        console.log("kliknuto");
    }
});