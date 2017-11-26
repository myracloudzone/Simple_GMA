GMApp.factory('ActivityService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/activity/:path', {
            path: '@path',
            }, {
                addActivity: { method: 'POST', params: {path: 'addActivity'}, isArray: false },
                // updateProduct: { method: 'POST', params: {path: 'updateProduct'}, isArray: false },
                list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: true },
                // getProductById: { method: 'GET', params: { id : '@id' , path: 'getProductById'}, isArray: false },
                deleteActivity: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'deleteActivity'}, isArray: false }
    });
}]);
