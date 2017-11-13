var LogoutCtrl = GMApp.controller('LogoutCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state', function($scope, $rootScope, $location, AuthService, ipCookie, $state){
    if(ipCookie('uuid') == null || ipCookie('uuid') == '') {
    	$state.go('login');
    } else {
    	 AuthService.logout({}, function(data){
    		ipCookie.remove('uuid');
            ipCookie.remove('account');
	        swal({  title:"",
	           text: "You have been successfully logout.",
	           type : "success",    
	           confirmButtonText: "Login",
	           closeOnConfirm: true,
	           confirmButtonClass: "btn btn-danger",
	           buttonsStyling: false,
	           allowEscapeKey: false
	        }, function(isConfirm) {
	           $state.go('login');
	        });
    	});
    }
}])
