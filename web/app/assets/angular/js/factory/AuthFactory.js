GMApp.factory('AuthService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/auth/:path', {
            path: '@path',
            }, {
              login: { method: 'POST', params: {path: 'login'}, isArray: false },
              logout: { method: 'POST', params: { path: 'logout'}, isArray: false }
    });
}]);