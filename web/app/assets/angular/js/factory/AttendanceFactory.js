GMApp.factory('AttendanceService',['$resource', function($resource) {
    return $resource(location.protocol+'//'+location.host + '/service/attendance/:path', {
            path: '@path',
            }, {
                checkIn: { method: 'POST', params: {path: 'checkIn'}, isArray: false },
                getHistory: { method: 'GET', params: {path: 'getHistory'}, isArray: false }
                       
    });
}]);