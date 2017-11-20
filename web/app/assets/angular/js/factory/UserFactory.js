GMApp.factory('UserService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/user/:path', {
            path: '@path',
            }, {
              getLoggedInUser: { method: 'GET', params: { id : '@id' , path: 'getLoggedInUser'}, isArray: false },
              changePassword: { method: 'POST', params: { id : '@id' , path: 'changePassword'}, isArray: false },              
              
    });
}]);
