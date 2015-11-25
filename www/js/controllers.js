var url = "http://userapan.myds.me/pooptrack_server/index.php";

angular.module('starter.controllers', ['ngCordova'])

.controller('MainCtrl', function($scope) {})

.controller('LoginCtrl', function($scope, $http, $ionicPopup, $state) {
  
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

        console.log("storing user_id "+sendData["user_id"]);
        console.log("storing name "+sendData["name"]);

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

.controller('NearbyCtrl', function($scope, $state, $http, $cordovaGeolocation, $ionicLoading, $compile) {
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
        // var welcomePopup = $ionicPopup.alert({
        //   title : "Could not get feed",
        //   subTitle: data.error_msg
        // });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });

    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(
      function(position) {
        var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
          center: myLatlng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),mapOptions);
       
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        if (window.localStorage['feed']) {
          var feed = JSON.parse(window.localStorage['feed']);
          var marker = [];
          var infowindow = [];

          for(var i = 0; i < feed.length; i++) {
            var tempPos = feed[i].location.split(",");
            var pos = new google.maps.LatLng(tempPos[0], tempPos[1]);
            marker[i] = new google.maps.Marker({
              position: pos,
              map: map,
              title: feed[i].name
            });

          // infowindow[i] = new google.maps.InfoWindow({
          // 	position: pos,
          // 	content: compiled[0]
          // });

          // google.maps.event.addListener(marker[i], 'click', function() {
          //   console.log("fittskalle "+i);
          //   infowindow[i].open(map,marker[0]);
          // });
          }
          $scope.map = map;
        } else {
          console.log("No feed to display on map yet!");
        }
      }, function(error){
        console.log("Could not get location");
      }
    );
  
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
      alert('asdasd')
    };
	});
})
// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

.controller('AddCtrl', function($scope, $http, $ionicPopup, $cordovaGeolocation, $state) {
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
})

.controller('AddDetailCtrl', function($scope, $stateParams, $http, $state, $cordovaGeolocation, $ionicHistory) {
  $scope.type = $stateParams.type;
  var lat = "";
  var longi = "";
  var timeoutId = null;
  var options = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    lat = position.coords.latitude;
    longi = position.coords.longitude;
  });
    
  $scope.add = {};
  $scope.add.rangeValue = 40;
  $scope.add.comment = "";
  
  $scope.$watch('add.rangeValue',function(val,old){
     $scope.add.rangeValue = parseInt(val);
  });
  
  $scope.rangeFilter = function(number) {
      return (number.value > $scope.add.rangeValue);
  }

  $scope.addToDatabase = function(type) {
    var sendData = {
          'tag': "addPoop",      
          'user_id': window.localStorage['user_id'],
          'type': type,
          'comment': $scope.add.comment,
          'location': lat+","+longi,
          'rate': $scope.add.rangeValue
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

    $ionicHistory.goBack();

    setTimeout(function(){
      $state.go('tab.feed');
    }, 100);
    

  };
})

.controller('FriendsCtrl', function($scope, $http, $ionicPopup) {
    var sendData = {
      'tag': "getAllUsers",
      'user_id': window.localStorage['user_id'],
    };

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);

      if (data.success === 1) {
        $scope.users = data.users;
      } else {
        console.log(data.error_msg);
        // var welcomePopup = $ionicPopup.alert({
        //   title : "Error",
        //   subTitle: data.error_msg
        // });        
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });

    $scope.addFriend = function(friend) {
      console.log(friend.user_id);
      var sendData = {
        'tag': "addFriend",
        'user_id': window.localStorage['user_id'],
        'friend': friend.user_id
      };

      $http.post(url, sendData)
      .success(function(data, status, headers, config) {
        console.log(data);

        if (data.success === 1) {
          $scope.users = data.users;
            var friendPopup = $ionicPopup.alert({
              title : "Makin' connections",
              subTitle: "You are now friend with \""+sendData["friend"]+"\"!"
            });          
        } else {
          console.log(data.error_msg);
          // var welcomePopup = $ionicPopup.alert({
          //   title : "Error",
          //   subTitle: data.error_msg
          // });        
        }
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });      
    }
})

.controller('ProfileCtrl', function($scope, $http, $ionicPopup, $state) {
  $scope.$on('$ionicView.enter', function() {
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

      $http.post(url, sendData)
      .success(function(data, status, headers, config) {
        console.log(data);

        if (data.success === 1) {
          $scope.count = data.count;
          $scope.most_used = data.most_used;
        } else {
          console.log(data.error_msg);
          $scope.dumps = 0;    
        }
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });    
    };

    $scope.countDumps();
  });  
});