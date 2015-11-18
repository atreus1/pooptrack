angular.module('starter.controllers', [])

.controller('MainCtrl', function($scope) {})

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state, $http) {
  // TODO skriv om POST delen
  // http://www.codeproject.com/Articles/1005150/Posting-data-from-Ionic-app-to-PHP-server
  if(!window.localStorage['user_id']) {
         var d = new Date();
         var n = d.getTime();
         var r = Math.floor((Math.random() * n) / 1000000);
         window.localStorage['user_id'] = r;
             var welcomePopup = $ionicPopup.prompt({
              title : 'welcome dumper! yes',
              subTitle: 'you have been assigned the wounderfull user_id of #' + r,
              inputType: 'text',
              inputPlaceholder: 'your username .. press cancel anon',
             }).then(function(res) {
              if(!res){
                window.localStorage['user_name'] = "anon";
                $http.post("http://tolva.nu/insertUser.php?u="+r+"&n=anon");
              }
              else{
                window.localStorage['user_name'] = res;
                $http.post("http://tolva.nu/insertUser.php?u="+r+"&n="+res);
              }
              $state.go('tab.feed');
            });
  }
  else{
    $state.go('tab.feed');
  }
})

.controller('FeedCtrl', function($scope, $http) {
  // TODO  uppdatera med local cache! så vi klarar oss utan internet
  // https://blog.nraboy.com/2014/06/saving-data-with-ionicframework/
  $scope.$on('$ionicView.beforeEnter', function() {
    $http.get('http://tolva.nu/getFeed.php').success(function(data) {
         $scope.feed = data;
      });
    });
    
     $scope.doRefresh = function() {
      $http.get('http://tolva.nu/getFeed.php')
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
  if(!window.localStorage['poops']) { 
    $http.get('http://tolva.nu/getPoops.php')
    .success(function(data) {
         window.localStorage.setItem("poops", JSON.stringify(data));
     });
  } 
  
  $scope.poops = JSON.parse(window.localStorage.getItem("poops"));
  
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
              // TODO skriv om POST delen
              // http://www.codeproject.com/Articles/1005150/Posting-data-from-Ionic-app-to-PHP-server
              $http.post("http://tolva.nu/insertPoops.php?u="+window.localStorage['user_id']+"&t="+type+"&r="+$scope.choice.value).success(function(data){      
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
$http.get('http://tolva.nu/getFriends.php').success(function(data) {
         $scope.users = data;
     });
})

.controller('ProfileCtrl', function($scope, $http, $ionicPopup, $state) {

$scope.erase = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'ggwp',
     template: 'sql data will remain on server for purely scientific reasons'
   });
   confirmPopup.then(function(res) {
     if(res) {
        window.localStorage.clear();
        $state.go('login');
     } else {
     }
   });
 };

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.localId = window.localStorage['user_id'];
    $scope.localName = window.localStorage['user_name'];
      // TODO skriv om GET delen
      // http://www.codeproject.com/Articles/1005150/Posting-data-from-Ionic-app-to-PHP-server
      $http.get("http://tolva.nu/getProfile.php?u="+window.localStorage['user_id']).success(function(data) {
           $scope.profile = data;
        });
      });

});