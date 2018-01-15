GMApp.factory('ProductService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/product/:path', {
            path: '@path',
            }, {
              addProduct: { method: 'POST', params: {path: 'addProduct'}, isArray: false },
              updateProduct: { method: 'POST', params: {path: 'updateProduct'}, isArray: false },
              list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: true },
              getProductById: { method: 'GET', params: { id : '@id' , path: 'getProductById'}, isArray: false },
              deleteProduct: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'deleteProduct'}, isArray: false },
              assignProductToUser: { method: 'POST', params: {path: 'assignProductToUser'}, isArray: false },
              getProductsToMember: { method: 'GET', params: { accountId : '@accountId' , path: 'getProductsToMember'}, isArray: true },
              returnOrder: { method: 'POST', params: {path: 'returnOrder'}, isArray: false }   
    });
}]);
