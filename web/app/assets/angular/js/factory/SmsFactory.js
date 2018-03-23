GMApp.factory('SmsService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/sms/:path', {
        
        }, {
            sendMessage : { method: 'POST', params: { accountId : '@accountId', path: 'sendMessage'}, isArray: false },
            sendGroupMessage : { method: 'POST', params: { accountId : '@accountId', path: 'sendGroupMessage'}, isArray: false },
            getSentMesssageHistory : { method: 'GET', params: { accountId : '@accountId', path: 'getSentMesssageHistory'}, isArray: false }
    });
}]);