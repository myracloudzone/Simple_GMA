
GMApp.factory('MembershipService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/membership/:path', {
        path: '@path',
        }, {
        getByMemberId: { method: 'GET', params: { accountId : '@accountId' , path: 'getMemebershipToMemberById'}, isArray: false },
        addPayment: { method: 'POST', params: { accountId : '@accountId' , path: 'addPayment'}, isArray: false },
        getTransactionHistory: { method: 'GET', params: { accountId : '@accountId' , path: 'getTransactionHistory'}, isArray: true },
        checkForMembershipUpgrade: { method: 'GET', params: { accountId : '@accountId' , path: 'checkForMembershipUpgrade'}, isArray: false },
        updateMembershipOfMember: { method: 'POST', params: { accountId : '@accountId' , path: 'updateMembershipOfMember'}, isArray: false }, 
        refundAmount: { method: 'POST', params: { accountId : '@accountId' , path: 'refundAmount'}, isArray: false },    
    });
}]);
