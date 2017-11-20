GMApp.factory('AccountService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/account/:path', {
            path: '@path',
            }, {
              getById: { method: 'GET', params: { id : '@id' , path: 'getById'}, isArray: false },
    });
}]);
