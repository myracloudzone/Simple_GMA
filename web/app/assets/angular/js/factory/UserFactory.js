GMApp.factory('UserService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/user/:path', {
            path: '@path',
            }, {
              getLoggedInUser : { method: 'GET', params: { id : '@id' , path: 'getLoggedInUser'}, isArray: false },
              list : { method: 'GET', params: { path: 'list'}, isArray: false },
              changePassword : { method: 'POST', params: { id : '@id' , path: 'changePassword'}, isArray: false },
              createUser : { method: 'POST', params: { path: 'createUser'}, isArray: false }, 
              getUser : { method: 'GET', params: { path: 'getUser'}, isArray: false } ,
              updateUser : { method: 'POST', params: { path: 'updateUser'}, isArray: false },
              deleteUser : { method: 'POST', params: { path: 'deleteUser'}, isArray: false }
    });
}]);
