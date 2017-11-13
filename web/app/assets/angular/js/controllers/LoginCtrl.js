var LoginCtrl = GMApp.controller('LoginCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state', function($scope, $rootScope, $location, AuthService, ipCookie, $state){
    $scope.user = {};
    $scope.invalidCredential = false;
    $scope.init = function(){
		console.log(ipCookie('uuid'));
		console.log(ipCookie('account'));
		if(ipCookie('uuid') != null && ipCookie('account') != null && ipCookie('account') != '') {
			$state.go('home', {id : ipCookie('account')});
		}
    }
    $scope.login = function() {
      	AuthService.login({username : $scope.user.username, password : $scope.user.password}, function(data) {
			if(data) {
				ipCookie('uuid', data.uuid, { expires: 2 });
				ipCookie('account', data.accountId, { expires: 2 });
				$state.go('home', {id : data.accountId});
				$scope.invalidCredential = false;
			} else {
				$scope.invalidCredential = true;
			}
      	}, function(error) {
			  $scope.invalidCredential = true;
		})
    }
    $scope.init();
}])
