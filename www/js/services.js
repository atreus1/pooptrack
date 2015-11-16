angular.module('starter.services', [])

.service('LoginService', function($q) {
  return {
    loginUser: function() {
      if(!localStorage['user_id']) {
        var d = new Date();
        var n = d.getTime();
        var r = Math.floor((Math.random() * n) +1);
        window.localStorage['user_id'] = r;
      }
      else
         window.localStorage['user_id'] = r;
     return r
    }
  }
});
