GMApp.factory('GroupService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/group/:path', {
            path: '@path',
            }, {
              addEditGroup: { method: 'POST', params: {path: 'add'}, isArray: false },
              list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: false },
              getById: { method: 'GET', params: { id : '@id' , path: 'getById'}, isArray: false },
              deleteGroupById: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'deleteGroupById'}, isArray: false },
              assignGroupToMember: { method: 'POST', params: {path: 'assignGroupToMember'}, isArray: false }
              
    });
}]);
