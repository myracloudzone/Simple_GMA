GMApp.factory('MemberService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/member/:path', {
            path: '@path',
            }, {
            addMember : { method: 'POST', params: {path: 'add'}, isArray: false },
            list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: false },
            getById: { method: 'GET', params: { id : '@id' , path: 'getById'}, isArray: false },
            updateMember: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'update'}, isArray: false },
            deleteMember: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'delete'}, isArray: false },
            documents: { method: 'GET', params: { accountId : '@accountId' , path: 'documents'}, isArray: true },
            count: { method: 'GET', params: { accountId : '@accountId' , path: 'count'}, isArray: false },

    });
}]);
