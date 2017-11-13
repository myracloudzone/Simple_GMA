GMApp.factory('CustomFieldService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/customfield/:path', {
            path: '@path',
            }, {
              createField: { method: 'POST', params: {path: 'createField'}, isArray: false }
    });
}]);