'use strict';

var app = angular.module("application", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html",
            controller: "homeCtrl"
        })
        .when("/login", {
            templateUrl: "login.html",
            controller: "loginCtrl"
        })
        .when("/addUser", {
            templateUrl: "addUser.html"
        })
        .when("/createKajmak", {
            templateUrl: "createKajmak.html",
            controller: "createKajmakCtrl"
        })
        .when("/listKajmak", {
            templateUrl: "listKajmak.html",
            controller: "listKajmakCtrl"
        })
        .when("/mixKajmak", {
            templateUrl: "mixKajmak.html",
            controller: "mixKajmakCtrl"
        })
        .when("/details", {
            templateUrl: "details.html",
            controller: "detailsCtrl"
        });
});

app.controller("homeCtrl", function ($scope) {
    $scope.start = function () {
        console.log("kliknuto");
    }
});

app.controller("loginCtrl", function ($scope, appFactory) {
    $scope.loginUser = function () {
        console.log("kliknuto na login");
    }
});

app.controller("createKajmakCtrl", function ($scope, appFactory) {
    $scope.recordKajmak = function () {
        console.log("kliknuto recordKajmak");
        var trenutniDatum = new Date();
        var year = trenutniDatum.getFullYear().toString();
        var month = (trenutniDatum.getMonth() + 1).toString();
        var day = trenutniDatum.getDate().toString();
        var hour = trenutniDatum.getHours().toString();
        var min = trenutniDatum.getMinutes().toString();
        var ampm = hour >= 12 ? 'pm' : 'am';
        hour = hour % 12;
        hour = hour ? hour : 12;
        min = min < 10 ? '0' + min : min;


        $scope.kajmak.productionDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + ampm;
        console.log($scope.kajmak);
        if ($scope.kajmak.unit == "min") {
            var m = parseInt($scope.kajmak.number);
            var newMin = new Date();
            newMin.setMinutes(newMin.getMinutes() + m);

            min = newMin.getMinutes().toString();
            hour = newMin.getHours().toString();
            day = newMin.getDate().toString();
            
            ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;
            hour = hour ? hour : 12;
            min = min < 10 ? '0' + min : min;
        }
        else if ($scope.kajmak.unit == "hour") {
            var h = parseInt($scope.kajmak.number);
            var newHour = new Date();
            newHour.setHours(newHour.getHours() + h);

            hour = newHour.getHours().toString();
            day = newHour.getDate().toString();
            ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;
            hour = hour ? hour : 12;
            min = min < 10 ? '0' + min : min;
        }
        else {
            var mth = parseInt($scope.kajmak.number);
            var newMonth = new Date();
            newMonth.setMonth((newMonth.getMonth() + 1) + mth);
            month = newMonth.getMonth().toString();
            year = newMonth.getFullYear().toString();

        }

        $scope.kajmak.expirationDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + ampm;


        appFactory.recordKajmak($scope.kajmak, function (data) {
            //$scope.create_kajmak = data;
            console.log("U redu");

        });
        $scope.poruka = "Kajmak Created!";
    }
});

app.controller("listKajmakCtrl", ["$scope", "appFactory", "myService", function ($scope, appFactory, myService) {
    $scope.queryAllKajmak = function () {
        console.log("listaaa");
        appFactory.queryAllKajmak(function (data) {
            console.log("vdjksg");
            var array = [];
            for (var i = 0; i < data.length; i++) {
                parseInt(data[i].Key);
                data[i].Record.Key = parseInt(data[i].Key);
                array.push(data[i].Record);
            }
            array.sort(function (a, b) {
                return parseFloat(a.Key) - parseFloat(b.Key);
            });
            $scope.all_kajmak = array;
        });
    }
    $scope.getDetails = function (index) {
        var kajmakDetails = $scope.all_kajmak[index];
        console.log(kajmakDetails);
        myService.setJson(kajmakDetails);
    }
    $scope.deleteKajmak = function (index) {
        var kajmak = $scope.all_kajmak[index];
        console.log(kajmak);
        appFactory.deleteKajmak(kajmak, function (data) {
            console.log("Kajmak obrisan");
        })
    }



}]);


app.controller("detailsCtrl", ["$scope", "appFactory", "myService", function ($scope, appFactory, myService) {
    $scope.myreturnedData = myService.getJson();
    $scope.changeOwner = function () {
        $scope.owner.id = $scope.myreturnedData.Key;
        appFactory.changeOwner($scope.owner, function (data) {
            console.log("promijenjen vlasnik");
        });
    }
}]);

app.controller("mixKajmakCtrl", ["$scope", "appFactory", "myService", function ($scope, appFactory, myService) {
    $scope.queryAllKajmak = function () {
        console.log("listaaa");
        appFactory.queryAllKajmak(function (data) {
            console.log("vdjksg");
            var array = [];
            for (var i = 0; i < data.length; i++) {
                parseInt(data[i].Key);
                data[i].Record.Key = parseInt(data[i].Key);
                array.push(data[i].Record);
            }
            array.sort(function (a, b) {
                return parseFloat(a.Key) - parseFloat(b.Key);
            });
            $scope.all_kajmak = array;
        });
    }

    $scope.getKajmak1 = function (index) {
        var kajmak1 = $scope.all_kajmak[index];
        myService.setKajmak1(kajmak1);
    }

    $scope.getKajmak2 = function (index) {
        var kajmak2 = $scope.all_kajmak[index];
        myService.setKajmak2(kajmak2);
    }
    $scope.mixKajmak = function () {
        var prvi = myService.getKajmak1();
        console.log(prvi);
        var drugi = myService.getKajmak2();
        console.log(drugi);
        var kolicina1 = Number(prvi.quantity);
        var kolicina2 = Number(drugi.quantity);
        var sumaKolicina = kolicina1 + kolicina2;

        var parts1 = prvi.production_date.split('.');
        var mydate1 = new Date(parts1[2], parts1[1] - 1, parts1[0]);

        var parts2 = drugi.production_date.split('.');
        var mydate2 = new Date(parts2[2], parts2[1] - 1, parts2[0]);

        var parts3 = prvi.expiration_date.split('.');
        var mydate3 = new Date(parts3[2], parts3[1] - 1, parts3[0]);

        var parts4 = drugi.expiration_date.split('.');
        var mydate4 = new Date(parts4[2], parts4[1] - 1, parts4[0]);

        var finalProductionDate = "";
        var finalExpirationDate = "";
        if (mydate1 > mydate2) {
            var year = mydate1.getFullYear().toString();
            var month = (mydate1.getMonth() + 1).toString();
            var day = mydate1.getDate().toString();
            finalProductionDate = day + "." + month + "." + year + ".";
        }
        else {
            var year = mydate2.getFullYear().toString();
            var month = (mydate2.getMonth() + 1).toString();
            var day = mydate2.getDate().toString();
            finalProductionDate = day + "." + month + "." + year + ".";
        }


        if (mydate3 < mydate4) {
            var year = mydate3.getFullYear().toString();
            var month = (mydate3.getMonth() + 1).toString();
            var day = mydate3.getDate().toString();
            finalExpirationDate = day + "." + month + "." + year + ".";
        }
        else {
            var year = mydate4.getFullYear().toString();
            var month = (mydate4.getMonth() + 1).toString();
            var day = mydate4.getDate().toString();
            finalExpirationDate = day + "." + month + "." + year + ".";

        }
        var newKajmak = {
            id: (prvi.Key).toString() + (drugi.Key).toString(),
            name: prvi.name + "&" + drugi.name,
            owner: prvi.owner,
            animal: prvi.animal + drugi.animal,
            location: prvi.location + drugi.location,
            quantity: (sumaKolicina).toString(),
            productionDate: finalProductionDate,
            expirationDate: finalExpirationDate,

        }
        console.log(newKajmak);
        appFactory.recordKajmak(newKajmak, function (data) {
            //$scope.create_kajmak = data;
            console.log("U redu");
        });
        $scope.poruka = "Kajmak Mixed Successfully!";
        appFactory.deleteKajmak(prvi, function (data) {
            console.log("Kajmak obrisan");
        });
        appFactory.deleteKajmak(drugi, function (data) {
            console.log("Kajmak obrisan");
        });
    }
}]);

// Angular Factory
app.factory('appFactory', function ($http) {
    var factory = {};
    factory.queryAllKajmak = function (callback) {
        console.log("uslo");
        $http.get('/get_all_kajmak/').success(function (output) {
            callback(output)
        });
    }

    factory.recordKajmak = function (data, callback) {

        var kajmak = data.id + "-" + data.name + "-" + data.owner + "-" + data.animal + "-" + data.location + "-" + data.quantity + "-" + data.productionDate + "-" + data.expirationDate;
        $http.get('/add_kajmak/' + kajmak).success(function (output) {
            callback(output)
        });
    }

    factory.changeOwner = function (data, callback) {
        console.log("uslo");
        var owner = data.id + "-" + data.name;
        $http.get('/change_owner/' + owner).success(function (output) {
            callback(output)
        });
    }

    factory.deleteKajmak = function (data, callback) {
        console.log("uslo u deleteKajmak");
        $http.get('/delete_kajmak/' + data.Key).success(function (output) {
            callback(output);
        });
    }

    return factory;
});

app.factory('myService', function () {
    var myjsonObj = null;//the object to hold our data
    var kajmak1Obj = null;
    var kajmak2Obj = null;
    return {
        getJson: function () {
            return myjsonObj;
        },
        getKajmak1: function () {
            return kajmak1Obj;
        },
        getKajmak2: function () {
            return kajmak2Obj;
        },
        setJson: function (value) {
            myjsonObj = value;
        },
        setKajmak1: function (value) {
            kajmak1Obj = value;
        },
        setKajmak2: function (value) {
            kajmak2Obj = value;
        }
    }
});