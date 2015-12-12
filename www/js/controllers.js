var url = "http://userapan.myds.me/pooptrack_server/index.php";

angular.module('starter.controllers', ['ngCordova'])

// ##################################################################

.controller('MainCtrl', function($scope) {})

// ##################################################################

// Controller for login.html
.controller('LoginCtrl', function($scope, $state, $cordovaProgress, DBService) {

  // Check if user is already logged in, then go to feed.
  if(window.localStorage['user_id']) {
    $state.go('tab.feed');
  }

  // Create javascript object to get user parameters
  $scope.user = {};

  // Perform login function
  $scope.login = function(anonymous) {
    var sendData = {'tag':"login", 'user_id':$scope.user.username, 'password':$scope.user.password};

    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        // Store user in cache
        window.localStorage['user_id'] = sendData["user_id"];
        window.localStorage['name'] = promise.data.user.name;

        // Go to global feed
        $state.go('tab.feed');
      }
    });
  }

  $scope.anon = function() {
    var random = Math.random().toString(36).substring(3);
    var sendData = {'tag':"register", 'user_id':random, 'password':"", 'name':random};

    DBService.sendToDB(sendData, true).then(function(promise) {        
      if (promise.data.success === 1) {
        // Store user in cache
        window.localStorage['user_id'] = random;
        window.localStorage['name'] = random;

        // Go to global feed
        $state.go('tab.feed');
      }
    });
  }
})

// ##################################################################

// Controller for register.html
.controller('RegisterCtrl', function($scope, $ionicPopup, $state, $cordovaProgress, DBService) {
  // Create javascript object to get user parameters
  $scope.user = {};

  // Register user
  $scope.register = function() {
    var sendData = {'tag':"register", 'user_id':$scope.user.username, 'password':$scope.user.password, 'name':$scope.user.name};

    // if (ionic.Platform.isIOS()) {
    //   $cordovaProgress.showSimple(true);
    // }

    DBService.sendToDB(sendData, true).then(function(promise) {
      // if (ionic.Platform.isIOS()) {
      //   $cordovaProgress.hide();
      // }

      if (promise.data.success === 1) {
        // Store user in cache
        window.localStorage['user_id'] = sendData["user_id"];
        window.localStorage['name'] = sendData["name"];

        // Display welcome message
        $ionicPopup.alert({
          title : "Registration complete!",
          subTitle: "Welcome "+sendData["name"]+"!"
        }).then(function(res) {
          $state.go('tab.feed');
        });
      }
    });
  }
})

// ##################################################################

// Controller for tab-feed-global.html
.controller('GlobalFeedCtrl', function($scope, DBService) {
  var sendData = {'tag':'getFeed', 'user_id':window.localStorage['user_id']};

  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.doRefresh();
  });

  // Update feed from database
  $scope.doRefresh = function() {
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.feed = promise.data.feed;
        window.localStorage.setItem("feed", JSON.stringify(promise.data.feed)); // Not doing anything with the data?
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
})

// ##################################################################

// Controller for tab-feed-friends.html
.controller('FriendsFeedCtrl', function($scope, DBService) {
  var sendData = {'tag':'getFriendFeed', 'user_id':window.localStorage['user_id']};

  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.doRefresh();
  });

  // Update feed from database
  $scope.doRefresh = function() {
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.feed = promise.data.feed;
        // window.localStorage.setItem("feed", JSON.stringify(promise.data.feed)); // Not doing anything with the data?
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
})

// ##################################################################

// Controller for tab-nearby.html
.controller('NearbyCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading) {

  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(
      function(position) {
      	var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
          center: myLatlng,
          zoom: 15,
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),mapOptions);

        if (window.localStorage['feed']) {
          var feed = JSON.parse(window.localStorage['feed']);
          var marker = [];

    			for(var i = 0; i < feed.length; i++) {
    				var tempPos = feed[i].location.split(",");
    				var pos = new google.maps.LatLng(tempPos[0], tempPos[1]);
    				marker[i] = new google.maps.Marker({
    				  position: pos,
    				  map: map,
    				  title: feed[i].name
    				});
    			}
          $scope.map = map;
        } else {
          console.log("No feed to display on map yet!");
        }
      }, function(error){
        console.log("Could not get location");
      }
    );
  
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
	});
})

// ##################################################################

// Controller for tab-add.html
.controller('AddCtrl', function($scope, $http, $ionicPopup, $cordovaGeolocation, $state, $ionicListDelegate) {

  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    if(window.localStorage['poops'] == undefined) {  // Needs to be re-written to target actual database
      $http.get('http://tolva.nu/poop/getPoops.php')
      .success(function(data) {
        $scope.poops = data;
           window.localStorage.setItem("poops", JSON.stringify(data));
       });
    } 
    $scope.poops = JSON.parse(window.localStorage.getItem("poops"));
  });

  // Poop descriptions
  $scope.desc = function(desc) {
    var alertPopup = $ionicPopup.alert({
      title: 'Story time!',
      template: desc
    });
    $ionicListDelegate.closeOptionButtons();
  };
})

// ##################################################################

// Controller for tab-add-detail.html
.controller('AddDetailCtrl', function($scope, $stateParams, $state, $cordovaGeolocation, $ionicHistory, DBService) {

  // Store in-parameter of poop type
  $scope.type = $stateParams.type;
  var lat = "";
  var longi = "";

  var options = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    // Store device position in variables
    lat = position.coords.latitude;
    longi = position.coords.longitude;
  });
  
  // Allocate memory for user inputs
  $scope.add = {};
  $scope.add.rangeValue = 40;
  $scope.add.comment = "";
  
  // Update slider value when dragging
  $scope.$watch('add.rangeValue',function(newVal, oldVal){
     $scope.add.rangeValue = parseInt(newVal);
  });

  // Add new poop event to database
  $scope.addToDatabase = function(type) {
    var sendData = {'tag':"addPoop", 'user_id':window.localStorage['user_id'], 'type':type, 'comment':$scope.add.comment, 'location':lat+","+longi, 'rate':$scope.add.rangeValue};

    DBService.sendToDB(sendData, false).then(function(promise) {});

    // Back out from inner view
    $ionicHistory.goBack();

    setTimeout(function(){
      // Go to feed
      $state.go('tab.feed');
    }, 250);
  };
})

// ##################################################################

// Controller for tab-friends.html
.controller('FriendsCtrl', function($scope, $http, $ionicPopup, $ionicListDelegate, $state, DBService) {
  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.displayFriends();
  });

  // Show all friends of current user
  $scope.displayFriends = function() {
    var sendData = {'tag':"getFriends",'user_id': window.localStorage['user_id']};

    $scope.searchField = {};
    $scope.searchField.query = "";

    $scope.message = "No users to display. Try search for one!";

    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.friends = promise.data.friends;
        $("#noFriends").css({"display": "none"});
      } else {
        $scope.friends = {};
        $("#noFriends").css({"display": "block"});        
      }
    });   
  }


  // Triggers whit submit at search field. Search for users in
  // database which is matching $scope.searchField.query
  $scope.doSearch = function() {
    $scope.tag = "";

    if ($scope.searchField.query !== "") {
      if ($scope.searchField.query === "*") {
        $scope.tag = "getAllUsers";
      } else {
        $scope.tag = "searchFriends";
      }
    } else {
      return;
    }

    var sendData = {'tag':$scope.tag, 'user_id':window.localStorage['user_id'], 'query':$scope.searchField.query};

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);
      $("#resultTitle").css({"display": "block"});
      if (data.success === 1) {
        $("#noResult").css({"display": "none"});        
        $scope.users = data.user;
      } else {
        console.log(data.error_msg);
        $scope.users = null;
        $scope.message = "Could not find any mathing users. Tip: use * to search for all users.";
        $("#noResult").css({"display": "block"});

      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });      
  };    


  // Add friend and stores it in the database
  $scope.addFriend = function(friend) {
    var sendData = {'tag':"addFriend", 'user_id':window.localStorage['user_id'], 'friend':friend.user_id};

    $http.post(url, sendData)
    .success(function(data, status, headers, config) {
      console.log(data);
      if (data.success === 1) {
        $scope.users = data.users;
        var friendPopup = $ionicPopup.alert({
          title : "Makin' connections",
          subTitle: "You are now friend with \""+sendData["friend"]+"\"!"
        });
        $("#resultTitle").css({"display": "none"});
        $ionicListDelegate.closeOptionButtons();
        $state.reload();
        $scope.displayFriends();
      } else {
        console.log(data.error_msg);       
      }
    })
    .error(function(data, status, headers, config) {
      console.log('error');
    });      
  };


  // Delete friend connection from database
  $scope.deleteFriend = function(friend) {
    var remove = $ionicPopup.confirm({
        title: "Confirm removal",
        template: "Are you sure you want to remove "+friend.friend_with+" as your friend?",
        okType: "button-assertive"
    }).then(function(res) {
     if (res){
        console.log("remove friend");
        var sendData = {'tag':"removeFriend", 'user_id':friend.user_id, 'friend':friend.friend_with};

        $http.post(url, sendData)
        .success(function(data, status, headers, config) {
          console.log(data);
          if (data.success === 1) {
            $ionicListDelegate.closeOptionButtons();
            $scope.displayFriends();
          } else {
            console.log(data.error_msg);
          }
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });            
      }
    });
    $state.reload();     
  };
})


// ##################################################################


// Controller for tab-profile.html
.controller('ProfileCtrl', function($scope, $http, $ionicPopup, $state, $ionicListDelegate, $ionicHistory) {
  
  // Do function each time user enters scene
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user_id = window.localStorage['user_id'];
    $scope.username = window.localStorage['name'];

    // Count all available #dumps in database
    $scope.countDumps = function() {
      var sendData = {'tag':"countDumps", 'user_id': window.localStorage['user_id']};

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

    $scope.setUsername = function() {
      $scope.data = {}
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.username">',
        title: 'Enter Username',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.username) {
                e.preventDefault();
              } else {
                var sendData = {'tag':"setUsername", 'user_id':$scope.user_id, 'name':$scope.data.username};
                $http.post(url, sendData)
                .success(function(data, status, headers, config) {
                    console.log(data);
                    if (data.success === 1) {
                      window.localStorage['name'] = $scope.data.username;
                      $ionicListDelegate.closeOptionButtons();
                      $state.reload();
                    } else {
                      console.log(data.error_msg);
                    }
                })
                .error(function(data, status, headers, config) {
                  console.log('error');
                });
              }
            }
          }
        ]
      });
    };
  });  
})


// Angular directive for searcfield submission
.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});