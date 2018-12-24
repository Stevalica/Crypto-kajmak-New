'use strict';

var app = angular.module("application", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html",
            controller: "homeCtrl"
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
        })
        .when("/kajmakNotification", {
             templateUrl: "kajmakNotification.html",
             controller: "kajmakNotificationCtrl"
        });
});

app.controller("homeCtrl", function ($scope, $interval, appFactory) {
    $scope.start = function () {
        $interval(callAtInterval, 60000);

        function callAtInterval() {
            console.log("Interval occurred");
            var array = [];
            appFactory.queryAllKajmak(function (data) {
                for (var i = 0; i < data.length; i++) {
                    parseInt(data[i].Key);
                    data[i].Record.Key = parseInt(data[i].Key);
                    array.push(data[i].Record);
                }
                array.sort(function (a, b) {
                    return parseFloat(a.Key) - parseFloat(b.Key);
                });
                var current = new Date();
                var y = current.getFullYear().toString();
                var m = (current.getMonth() + 1).toString();
                var d = current.getDate().toString();
                var h = current.getHours().toString();
                var mi = current.getMinutes().toString();
                var ampm1 = h >= 12 ? 'pm' : 'am';
                h = h % 12;
                h = h ? h : 12;
                m = m < 10 ? '0' + m : m;

                let finalCurrentDate = d + "." + m + "." + y + "." + " " + h + ":" + mi + " " + ampm1;
                let parts1 = finalCurrentDate.split(/[\s.:]/);
                let mydate1 = new Date(parts1[2], parts1[1] - 1, parts1[0], parts1[4], parts1[5]);

                console.log(finalCurrentDate);
                for(var i = 0; i < array.length; i++) {
                    console.log(i);
                    var parts3 = array[i].expiration_date.split(/[\s.:]/);
                    var mydate4 = new Date(parts3[2], parts3[1] - 1, parts3[0], parts3[4], parts3[5]);
                    console.log(mydate4);
                    if(mydate1 >= mydate4) {
                        appFactory.deleteKajmak(array[i], function (data) {
                        console.log("Kajmak obrisan");
                        });
                    }
                }  
            });
        }
    }
});

app.controller("createKajmakCtrl", function ($scope, appFactory) {
    $scope.recordKajmak = function () {
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


        $scope.kajmak.productionDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + " " + ampm;
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
        else if ($scope.kajmak.unit == "days") {
            var d = parseInt($scope.kajmak.number);
            var newDays = new Date();
            newDays.setDate(newDays.getDate() + d);
            day = newDays.getDate().toString();
            var mth1 = newDays.getMonth() + 1;
            month = mth1.toString();

            year = newDays.getFullYear().toString();
        }

        else {
            var mth = parseInt($scope.kajmak.number);
            var newMonth = new Date();
            newMonth.setMonth(newMonth.getMonth() + mth);
            var monthInt = newMonth.getMonth() + 1;
            month = monthInt.toString();
            year = newMonth.getFullYear().toString();
        }

        $scope.kajmak.expirationDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + " " + ampm;
        appFactory.recordKajmak($scope.kajmak, function (data) {
            //$scope.create_kajmak = data;
            console.log("Podaci iz create kajmaka:" + data);

        });
        $scope.poruka = "Kajmak Created!";
    }
});

app.controller("listKajmakCtrl", ["$scope", "$interval","appFactory", "myService", function ($scope, $interval, appFactory, myService) {
    $scope.queryAllKajmak = function () {
        var array = [];
        appFactory.queryAllKajmak(function (data) {
            for (var i = 0; i < data.length; i++) {
                parseInt(data[i].Key);
                data[i].Record.Key = parseInt(data[i].Key);
                array.push(data[i].Record);
            }
            array.sort(function (a, b) {
                return parseFloat(a.Key) - parseFloat(b.Key);
            });
            $scope.all_kajmak = array;
            console.log(array);
        });
    }
    $scope.getDetails = function (index) {
        var kajmakDetails = $scope.all_kajmak[index];
        myService.setJson(kajmakDetails);
    }
    $scope.deleteKajmak = function (index) {
        var kajmak = $scope.all_kajmak[index];
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
        });
    }
}]);

app.controller("mixKajmakCtrl", ["$scope", "appFactory", "myService", function ($scope, appFactory, myService) {
    $scope.queryAllKajmak = function () {
        appFactory.queryAllKajmak(function (data) {
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
        var drugi = myService.getKajmak2();
        var kolicina1 = Number(prvi.quantity);
        var kolicina2 = Number(drugi.quantity);
        var percentage1 = parseInt($scope.kajmak.percentage1);
        var percentage2 = parseInt($scope.kajmak.percentage2);

        var quantity1 = kolicina1 * (percentage1 / 100);
        var quantity2 = kolicina2 * (percentage2 / 100);

        var sumaKolicina = quantity1 + quantity2 ;
        

        var parts1 = prvi.expiration_date.split(/[\s.:]/);
        var mydate1 = new Date(parts1[2], parts1[1] - 1, parts1[0], parts1[4], parts1[5]);
        console.log(parts1);

        var parts2 = drugi.expiration_date.split(/[\s.:]/);
        var mydate2 = new Date(parts2[2], parts2[1] - 1, parts2[0], parts2[4], parts2[5]);

        var finalProductionDate = "";
        var finalExpirationDate = "";
        var current = new Date();
        var y = current.getFullYear().toString();
        var m = (current.getMonth() + 1).toString();
        var d = current.getDate().toString();
        var h = current.getHours().toString();
        var mi = current.getMinutes().toString();
        var ampm1 = h >= 12 ? 'pm' : 'am';
        h = h % 12;
        h = h ? h : 12;
        m = m < 10 ? '0' + m : m;

        finalProductionDate = d + "." + m + "." + y + "." + " " + h + ":" + mi + " " + ampm1;
        if (mydate1 < mydate2) {
            console.log("USlooooo");
            var year = parts1[2];
            var month = parts1[1];
            var day = parts1[0];
            var hour = parts1[4];
            var min = parts1[5];
            var ampm = parts1[6];

            finalExpirationDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + " " + ampm;

        }

        else {
            var year = parts2[2];
            var month = parts2[1];
            var day = parts2[0];
            var hour = parts2[4];
            var min = parts2[5];
            var ampm = parts2[6];

            finalExpirationDate = day + "." + month + "." + year + "." + " " + hour + ":" + min + " " + ampm;
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
        console.log(data);
        var kjmk = data.Key + "-" + data.name + "-" + data.owner + "-" + data.animal + "-" + data.location + "-" + data.quantity + "-" + data.production_date + "-" + data.expiration_date;
        $http.get('/delete_kajmak/' + kjmk).success(function (output) {
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