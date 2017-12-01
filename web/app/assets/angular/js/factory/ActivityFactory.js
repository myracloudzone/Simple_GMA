GMApp.factory('ActivityService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/activity/:path', {
            path: '@path',
            }, {
                addActivity: { method: 'POST', params: {path: 'addActivity'}, isArray: false },
                updateActivity: { method: 'POST', params: {path: 'updateActivity'}, isArray: false },
                list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: true },
                getActivityById: { method: 'GET', params: { id : '@id' , path: 'getActivityById'}, isArray: false },
                deleteActivity: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'deleteActivity'}, isArray: false }
    });
}]);
