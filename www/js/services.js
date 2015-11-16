angular.module('starter.services', [])

.service('LoginService', function($q) {
  return {
    loginUser: function() {
      var d = new Date();
      var n = d.getTime();
      var r = Math.floor((Math.random() * n) +1);
     return r
    }
  }
});
