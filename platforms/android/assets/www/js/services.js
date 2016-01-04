angular.module('starter.services', [])

.factory('DBService', function($http, $ionicPopup) {
  return {
    hello: function() {
      return "hej";
    },
    sendToDB: function (json, showPopup) {
      var promise = $http({method:"POST", data:json, url:"http://userapan.myds.me/pooptrack_server/index.php"})
        .success(function (data, status, headers, config) {
          if (data.success !== 1) {
            console.log(data.error_msg);
            if (showPopup) {
              var welcomePopup = $ionicPopup.alert({
                title : "Unexpected error",
                subTitle: data.error_msg
              });
            }
          }
        })
        .error(function (data, status, headers, config) {
          console.log("Error in DBService");
        });
      return promise;
    }
  };
});