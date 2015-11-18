var url = "http://userapan.myds.me/pooptrack_server/index.php";

angular.module('starter.controllers', ['ngCordova'])

.controller('MainCtrl', function($scope) {})

// .controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state, $http) {
//   // TODO skriv om POST delen
//   // http://www.codeproject.com/Articles/1005150/Posting-data-from-Ionic-app-to-PHP-server
//   if(!window.localStorage['user_id']) {
//          var d = new Date();
//          var n = d.getTime();
//          var r = Math.floor((Math.random() * n) / 1000000);
//          window.localStorage['user_id'] = r;
//              var welcomePopup = $ionicPopup.prompt({
//               title : 'welcome dumper! yes',
//               subTitle: 'you have been assigned the wounderfull user_id of #' + r,
//               inputType: 'text',
//               inputPlaceholder: 'your username .. press cancel anon',
//              }).then(function(res) {
//               var link = "http://tolva.nu/poop/insertUser.php";
//               if(!res){
//                 window.localStorage['user_name'] = "anon";
//               $http.post(link, {user_id: r, name: window.localStorage['user_name']})
//                 .success(function(data){      
//                   $scope.tasks = data;
//               });
//               }
//               else{
//                 window.localStorage['user_name'] = res;
//                $http.post(link, {user_id: r, name: window.localStorage['user_name']})
//                 .success(function(data){      
//                   $scope.tasks = data;
//                });
//               }
//               $state.go('tab.feed');
//             });
//   }
//   else {
//     $state.go('tab.feed');
//   }
// })

.controller('LoginCtrl', function($scope, $http, $ionicPopup,  $state) {
  
  if(window.localStorage['user_id']) {
    $state.go('tab.feed');
  }

  $scope.user = {};

  $scope.login = function() {
    var sendData = {
      'tag': "login",
      'user_id': $scope.user.username,
      'password': $scope.user.password
    };

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);
      if (data.success === 1) {
        console.log("login complete");

        window.localStorage['user_id'] = sendData["user_id"];
        window.localStorage['name'] = data.user.name;

        $state.go('tab.feed');
      } else {
        console.log(data.error_msg);
        var welcomePopup = $ionicPopup.alert({
          title : "Login failure",
          subTitle: data.error_msg
        });
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });
  }
})

.controller('RegisterCtrl', function($scope, $http, $ionicPopup, $state) {
  $scope.user = {};

  $scope.register = function() {
    var sendData = {
      'tag': "register",      
      'user_id': $scope.user.username,
      'password': $scope.user.password,
      'name': $scope.user.name
    };

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);

      if (data.success === 1) {
        console.log("registration complete");

        window.localStorage['user_id'] = sendData["user_id"];
        window.localStorage['name'] = sendData["name"];

        var welcomePopup = $ionicPopup.alert({
          title : "Registration complete!",
          subTitle: "Welcome "+sendData["name"]+"!"
        }).then(function(res) {
          $state.go('tab.feed');
        });
      } else {
        console.log(data.error_msg);
        var welcomePopup = $ionicPopup.alert({
          title : "Registration failure",
          subTitle: data.error_msg
        });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });
  }
})

.controller('FeedCtrl', function($scope, $http, $ionicPopup) {
  // TODO  uppdatera med local cache! så vi klarar oss utan internet
  // https://blog.nraboy.com/2014/06/saving-data-with-ionicframework/
  $scope.$on('$ionicView.beforeEnter', function() {

    var sendData = {
      'tag': "getFeed",      
      'user_id': window.localStorage['user_id']
    };

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);

      if (data.success === 1) {
        console.log("getting feed :)");

        $scope.feed = data.feed;
        window.localStorage.setItem("feed", JSON.stringify(data.feed));

      } else {
        console.log(data.error_msg);
        var welcomePopup = $ionicPopup.alert({
          title : "Could not get feed",
          subTitle: data.error_msg
        });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });
  });
    
  $scope.doRefresh = function() {
    var sendData = {
      'tag': "getFeed",      
      'user_id': window.localStorage['user_id']
    };

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);

      if (data.success === 1) {
        console.log("getting feed refresh");

        $scope.feed = data.feed;
        window.localStorage.setItem("feed", JSON.stringify(data.feed));

      } else {
        console.log(data.error_msg);
        var welcomePopup = $ionicPopup.alert({
          title : "Could not get feed",
          subTitle: data.error_msg
        });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    })
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
})

.controller('NearbyCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading, $compile) {

  $scope.init = function() {
        var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
          var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
         
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);
        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var feed = JSON.parse(window.localStorage['feed']);
        var marker = [];

        // console.log(feed[1]);

        for(var i = 0; i < feed.length; i++) {
          var tempPos = feed[i].location.split(",");
          var pos = new google.maps.LatLng(tempPos[0], tempPos[1]);
          marker[i] = new google.maps.Marker({
            position: pos,
            map: map,
            title: "HEJ"
          });

          // google.maps.event.addListener(marker[i], 'click', function() {
          //   infowindow.open(map,marker[i]);
          //   console.log("hiora");
          // });
        }

        // var marker = new google.maps.Marker({
        //   position: myLatlng,
        //   map: map,
        //   title: 'asdas'
        // });

        // var myLatlng2 = new google.maps.LatLng(position.coords.latitude, "11.9690000");

        // var marker2 = new google.maps.Marker({
        //   position: myLatlng2,
        //   map: map,
        //   title: 'asdas'
        // });        
        // google.maps.event.addListener(marker, 'click', function() {
        //   infowindow.open(map,marker);
        // });
        $scope.map = map;
        }, function(error){
          console.log("Could not get location");
        });
    };
    // google.maps.event.addDomListener(window, 'load', initialize);
    $scope.centerOnMe = function() {
        if(!$scope.map) {
            return;
        }
        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };
    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };
})
// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

.controller('AddCtrl', function($scope, $http, $ionicPopup, $cordovaGeolocation) {
  $scope.$on('$ionicView.beforeEnter', function() {
      if(window.localStorage['poops'] == undefined) { 
        $http.get('http://tolva.nu/poop/getPoops.php')
        .success(function(data) {
          $scope.poops = data;
             window.localStorage.setItem("poops", JSON.stringify(data));
         });
      } 
      $scope.poops = JSON.parse(window.localStorage.getItem("poops"));
  });
  $scope.settings = {
    enableFriends: true
  };

  $scope.desc = function(desc) {
        var alertPopup = $ionicPopup.alert({
        title: 'Story time!',
        template: desc
      });
  };

  $scope.add = function(type) {
    $scope.choice = {};
    var lat = "";
    var longi = "";

    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
      lat = position.coords.latitude;
      longi = position.coords.longitude;
    });    

    var alertPopup = $ionicPopup.alert({
      title: 'poopy addy! rating',
      subTitle: 'Please use normal things',
      template: '<ion-radio ng-model="choice.value" ng-value="1"><i class="icon icon ion-star"></i></ion-radio><ion-radio ng-model="choice.value" ng-value="2"><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i></ion-radio><ion-radio ng-model="choice.value" ng-value="3"><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i></ion-radio>',
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel'
        },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.choice.value) {
              // don't allow the user to close unless he enters rating
              e.preventDefault();
            } else {
              var sendData = {
                'tag': "addPoop",      
                'user_id': window.localStorage['user_id'],
                'type': type,
                'location': lat+","+longi,
                'rate': $scope.choice.value
              };

              $http.post(url, sendData)
              .success(function(data, status, headers, config) {
                console.log(data);

                if (data.success === 1) {
                  console.log("added new poop post");

                } else {
                  console.log(data.error_msg);
                  var welcomePopup = $ionicPopup.alert({
                    title : "Error",
                    subTitle: data.error_msg
                  });        
                }
              })
              .error(function(data, status, headers, config) {
                console.log('error');
              });              
              // var link = "http://tolva.nu/poop/insertPoops.php";
              // $http.post(link, {user_id: window.localStorage['user_id'], type: type, rate: $scope.choice.value})
              // .success(function(data){      
              //   $scope.tasks = data;
              // });
              return $scope.choice.value;
            }
          }
        }
      ]
    });
  };
})

.controller('FriendsCtrl', function($scope, $http) {
// $http.get('http://tolva.nu/poop/getFriends.php').success(function(data) {
         $scope.users = "data";
     // });
})

.controller('ProfileCtrl', function($scope, $http, $ionicPopup, $state) {
  $scope.user_id = window.localStorage['user_id'];
  $scope.username = window.localStorage['name'];

  $scope.logout = function() {
    var logoutPopup = $ionicPopup.confirm({
      title: "Confirm logout",
      okType: "button-assertive"
    }).then(function(res) {
      if (res){
        console.log("logout");
        window.localStorage.clear();
        $state.go('login');        
      }
    });
  };

  $scope.countDumps = function() {
    var sendData = {
      'tag': "countDumps",      
      'user_id': window.localStorage['user_id']
    };

    console.log("HPIAHDGOIHG");

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);

      if (data.success === 1) {
        $scope.dumps = data.dumps;
      } else {
        console.log(data.error_msg);
        var welcomePopup = $ionicPopup.alert({
          title : "Error",
          subTitle: data.error_msg
        });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });    
  };  
});


// .controller('ProfileCtrl', function($scope, $http, $ionicPopup, $state) {

// $scope.erase = function() {
//    var confirmPopup = $ionicPopup.confirm({
//      title: 'ggwp',
//      template: 'sql data will remain on server for purely scientific reasons'
//    });
//    confirmPopup.then(function(res) {
//      if(res) {
//         window.localStorage.clear();
//         $state.go('login');
//      } else {
//      }
//    });
//  };

//   $scope.$on('$ionicView.beforeEnter', function() {
//     $scope.localId = window.localStorage['user_id'];
//     $scope.localName = window.localStorage['user_name'];
//       // TODO skriv om GET delen
//       // http://www.codeproject.com/Articles/1005150/Posting-data-from-Ionic-app-to-PHP-server
//       $http.get("http://tolva.nu/poop/getProfile.php?u="+window.localStorage['user_id']).success(function(data) {
//            $scope.profile = data;
//         });
//       });

// });