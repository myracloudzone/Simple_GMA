GMApp.factory('EmailService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/email/:path', {
        
        }, {
            sendEmail : { method: 'POST', params: { accountId : '@accountId', path: 'sendEmail'}, isArray: false }
    });
}]);