angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope) {})

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state) {
  $scope.user = {};

  $scope.login = function() {
    LoginService.loginUser($scope.user.username, $scope.user.password).success(function(user) {
      $state.go('tab.feed');
    }).error(function(user) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  }
})

.controller('FeedCtrl', function($scope, $http) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $http.get('http://userapan.myds.me/getFeed.php').success(function(data) {
         $scope.feed = data;
      });
    });
    
     $scope.doRefresh = function() {
      $http.get('http://userapan.myds.me/getFeed.php')
     .success(function(data) {
       $scope.feed = data;
     })
     .finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });
     };
})


.controller('NearbyCtrl', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // $scope.chats = Chats.all();
  // $scope.remove = function(chat) {
  //   Chats.remove(chat);
  // };
})

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// })

.controller('AddCtrl', function($scope, $http, $ionicPopup) {
  $http.get('http://userapan.myds.me/getPoops.php').success(function(data) {
         $scope.poops = data;
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
    $scope.choice = {}
        var alertPopup = $ionicPopup.alert({
        title: 'poopy addy! rating',
        subTitle: 'Please use normal things',
        template: '<ion-radio ng-model="choice.value" ng-value="1"><i class="icon icon ion-star"></i></ion-radio><ion-radio ng-model="choice.value" ng-value="2"><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i></ion-radio><ion-radio ng-model="choice.value" ng-value="3"><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i><i class="icon icon ion-star"></i></ion-radio>',
        scope: $scope,
        buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.choice.value) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
              $http.post("http://userapan.myds.me/insertPoops.php?u=jocke&t="+type+"&r="+$scope.choice.value).success(function(data){      
            $scope.tasks = data;
            });
          return $scope.choice.value;
          }
        }
      }
    ]
   });
        //end of popup

  };

})

.controller('FriendsCtrl', function($scope, $http) {
$http.get('http://userapan.myds.me/getFriends.php').success(function(data) {
         $scope.users = data;
     });
})

.controller('ProfileCtrl', function($scope, $http) {

$scope.$on('$ionicView.beforeEnter', function() {
    $http.get('http://userapan.myds.me/getProfile.php?u=jocke').success(function(data) {
         $scope.profile = data;
      });
    });
});