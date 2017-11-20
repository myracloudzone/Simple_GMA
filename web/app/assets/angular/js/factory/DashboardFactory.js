
GMApp.factory('DashboardService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/dashboard/:path', {
        
        }, {
            getMembershipDueMembers : { method: 'GET', params: { accountId : '@accountId', path: 'getMembershipDueMembers'}, isArray: true },
            getMembersWithBirthdayRange : { method: 'GET', params: { accountId : '@accountId', path: 'getMembersWithBirthdayRange'}, isArray: false },
            getMembersCountByMonth : { method: 'GET', params: { accountId : '@accountId', path: 'getMembersCountByMonth'}, isArray: false },
    });
}]);