GMApp.factory('UploadService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/upload/:path', {
        
        }, {
            uploadFile : { method: 'POST', isArray: false },
            deleteFile : { method: 'POST', params: { accountId : '@accountId', path: 'deleteFile'}, isArray: false }
    });
}]);
