GMApp.factory('TransactionService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/transaction/:path', {
        
        }, {
            getTotalAmount : { method: 'GET', params: { accountId : '@accountId', path: 'getTotalAmount'}, isArray: false },
            getTransactionHistoryForDashboard : { method: 'GET', params: { accountId : '@accountId', path: 'getTransactionHistoryForDashboard'}, isArray: false },            
            
    });
}]);