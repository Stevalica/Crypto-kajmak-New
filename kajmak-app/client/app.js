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
        templateUrl : "mixKajmak.html",
        controller : "mixKajmakCtrl"
    })
    .when("/details", {
        templateUrl : "details.html",
        controller : "detailsCtrl"
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

app.controller("listKajmakCtrl", ["$scope", "appFactory", "myService", function($scope,appFactory, myService) {
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
    $scope.getDetails = function(index) {
        var kajmakDetails = $scope.all_kajmak[index];
        console.log(kajmakDetails);
        myService.setJson(kajmakDetails);
    }
}]);


app.controller("detailsCtrl", ["$scope", "appFactory", "myService", function($scope,appFactory, myService) {
    $scope.myreturnedData = myService.getJson();
    $scope.changeOwner = function(){
        $scope.owner.id = $scope.myreturnedData.Key;
        appFactory.changeOwner($scope.owner, function(data){
            console.log("promijenjen vlasnik");
        });
    }
}]);

app.controller("mixKajmakCtrl", ["$scope", "appFactory", "myService", function($scope,appFactory, myService) {
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

    $scope.getKajmak1 = function(index) {
        var kajmak1 = $scope.all_kajmak[index];
        myService.setKajmak1(kajmak1);
    }

    $scope.getKajmak2 = function(index) {
        var kajmak2 = $scope.all_kajmak[index];
        myService.setKajmak2(kajmak2);
    }
    $scope.mixKajmak = function() {
        var prvi = myService.getKajmak1();
        console.log(prvi);
        var drugi = myService.getKajmak2();
        console.log(drugi);
        var kolicina1 = Number(prvi.quantity);
        var kolicina2 = Number(drugi.quantity);
        var sumaKolicina = kolicina1 + kolicina2;

        var parts1 = prvi.production_date.split('.');
        var mydate1 = new Date(parts1[0], parts1[1] - 1, parts1[2]);

        var parts2 = drugi.production_date.split('.');
        var mydate2 = new Date(parts2[0], parts2[1] - 1, parts2[2]);
        
        var finalProductionDate = "";
        if(mydate1 > mydate2) {
            var year = mydate1.getFullYear().toString();
            var month = (mydate1.getMonth() + 1).toString();
            var day = mydate1.getDate().toString();
            finalProductionDate = year + "." + month + "." + day;
        }
        else {
            var year = mydate2.getFullYear().toString();
            var month = (mydate2.getMonth() + 1).toString();
            var day = mydate2.getDate().toString();
            finalProductionDate = year + "." + month + "." + day;
        }
        var newKajmak = {
            id: (prvi.Key).toString() + (drugi.Key).toString(),
            name: prvi.name + drugi.name, 
            owner: prvi.owner,
            animal: prvi.animal + drugi.animal,
            location: prvi.location + drugi.location,
            quantity: (sumaKolicina).toString(),
            productionDate: finalProductionDate,
        }
        console.log(newKajmak);
        appFactory.recordKajmak(newKajmak, function(data){
            //$scope.create_kajmak = data;
            console.log("U redu");
        });
    }
}]);

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
        var parts = data.productionDate.split('.');
        var mydate = new Date(parts[0], parts[1] - 1, parts[2]);
        mydate.setDate(mydate.getDate() + 10);
        var year = mydate.getFullYear().toString();
        var month = (mydate.getMonth() + 1).toString();
        var day = mydate.getDate().toString();
        data.expirationDate = year + "." + month + "." + day;
        var kajmak = data.id + "-" + data.name + "-" + data.owner + "-" + data.animal + "-" + data.location + "-" + data.quantity + "-" + data.productionDate + "-" + data.expirationDate;
        $http.get('/add_kajmak/'+kajmak).success(function(output){
            callback(output)
        });
    }

    factory.changeOwner = function(data, callback){
        console.log("uslo");
        var owner = data.id + "-" + data.name;
        $http.get('/change_owner/'+owner).success(function(output){
            callback(output)
        });
    }

    return factory;
});

app.factory('myService', function(){
    var myjsonObj = null;//the object to hold our data
    var kajmak1Obj = null;
    var kajmak2Obj = null;
     return {
     getJson:function(){
       return myjsonObj;
     },
     getKajmak1:function(){
       return kajmak1Obj;
     },
     getKajmak2:function(){
       return kajmak2Obj;
     },
     setJson:function(value){
      myjsonObj = value;
     },
     setKajmak1:function(value){
      kajmak1Obj = value;
     },
     setKajmak2:function(value){
      kajmak2Obj = value;
     }
     }
});





