GMApp.factory('requestInterceptor', function($q, $injector, $rootScope, $timeout, ipCookie) {
	return {
		request: function(config) {
            config.headers = config.headers || {};
            config.headers['account'] = ipCookie('account');
            config.headers['uuid'] = ipCookie('uuid');
            return config;
		},
		response: function(response) {
           return response;
		},
		requestError: function(rejectReason) {
           return $q.reject(rejectReason);
		},
		responseError: function(rejectReason) {
           if(rejectReason.status === 401 || rejectReason.status === 403 ) {
        	    $rootScope.isSessionLogout = true;
        	    ipCookie.remove('uuid');
				ipCookie.remove('account');
				ipCookie.remove('loggedUser');
				swal({
                   title:"",
                   text: "Your Session has been expired. Please login again to continue.",
                   type: "warning",
                   confirmButtonText: "Login",
                   closeOnConfirm: true,
                   confirmButtonClass: "btn btn-danger",
                   buttonsStyling: false,
                   allowEscapeKey:false
                }, function(isConfirm) {
                   $injector.get('$state').transitionTo('login');
                });
				return $q.reject(rejectReason);
	        }
			else if(rejectReason.status === 429){
				return $q.reject(rejectReason);
			}
			else {
				return $q.reject(rejectReason);
		    }
		}
	};
});
