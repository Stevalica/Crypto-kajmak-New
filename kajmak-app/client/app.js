'use strict';

var app = angular.module("application", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.html",
        controller : "homeCtrl"
    })
    .when("/createKajmak", {
        templateUrl: "createKajmak.html",
        controller : "createKajmakCtrl"
    })
    .when("/listKajmak", {
        templateUrl : "listKajmak.html",
        controller : "listKajmakCtrl"
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

app.controller("createKajmakCtrl", function($scope,appFactory) {
    $scope.recordKajmak = function() {
        console.log("kliknuto recordKajmak");
        appFactory.recordKajmak($scope.kajmak, function(data){
            //$scope.create_kajmak = data;
            console.log("U redu");
        });
    }
});

app.controller("listKajmakCtrl", function($scope,appFactory) {
    $scope.queryAllKajmak = function() {
        console.log("listaaa");
        appFactory.queryAllKajmak(function(data){
            console.log("vdjksg");
            var array = [];
            for (var i = 0; i < data.length; i++){
                parseInt(data[i].Key);
                data[i].Record.Key = parseInt(data[i].Key);
                array.push(data[i].Record);
            }
            array.sort(function(a, b) {
                return parseFloat(a.Key) - parseFloat(b.Key);
            });
            $scope.all_kajmak = array;
        });
    }
});

// Angular Factory
app.factory('appFactory', function($http){
    var factory = {};
    factory.queryAllKajmak = function(callback){
        console.log("uslo");
        $http.get('/get_all_kajmak/').success(function(output){
            callback(output)
        });
    }

    factory.recordKajmak = function(data, callback) {
        data.expirationDate = data.productionDate + "M";
        var kajmak = data.id + "-" + data.name + "-" + data.owner + "-" + data.animal + "-" + data.location + "-" + data.quantity + "-" + data.productionDate + "-" + data.expirationDate;
        $http.get('/add_kajmak/'+kajmak).success(function(output){
            callback(output)
        });
    }
    return factory;
});




