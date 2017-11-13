GMApp.factory('SmsService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/sms/:path', {
        
        }, {
            sendMessage : { method: 'POST', params: { accountId : '@accountId', path: 'sendMessage'}, isArray: false }
    });
}]);