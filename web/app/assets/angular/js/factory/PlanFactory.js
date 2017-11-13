GMApp.factory('PlanService',['$resource',function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/plan/:path', {
            path: '@path',
            }, {
              addPlan: { method: 'POST', params: {path: 'addPlan'}, isArray: false },
              updatePlan: { method: 'POST', params: {path: 'updatePlan'}, isArray: false },
              list: { method: 'GET', params: { accountId : '@accountId' , path: 'list'}, isArray: false },
              getPlanById: { method: 'GET', params: { id : '@id' , path: 'getPlanById'}, isArray: false },
              deletePlanById: { method: 'POST', params: { accountId : '@accountId', id : '@id' , path: 'deletePlanById'}, isArray: false }
    });
}]);
