GMApp.factory('PasswordService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/password/:path', {
            path: '@path',
            }, {
              updateUserPassword: { method: 'POST', params: {path: 'updateUserPassword'}, isArray: false },
              generateLoginOTP: { method: 'POST', params: {path: 'generateLoginOTP'}, isArray: false }
    });
}]);
