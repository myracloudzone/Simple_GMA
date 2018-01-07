var LoginCtrl = GMApp.controller('LoginCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state','$mdDialog', 'GlobalMethodService', 'notificationService', function($scope, $rootScope, $location, AuthService, ipCookie, $state,$mdDialog, GlobalMethodService, notificationService){
    $scope.user = {};
    $scope.invalidCredential = false;
    $scope.init = function(){
		console.log(ipCookie('uuid'));
		console.log(ipCookie('account'));
		if(ipCookie('uuid') != null && ipCookie('uuid') != '' && ipCookie('account') != null && ipCookie('account') != '') {
			$state.go('home', {id : ipCookie('account')});
		}
    }
    $scope.login = function() {
		if(GlobalMethodService.isEmptyString($scope.user.username)) {
			notificationService.error("Username is required.");
			return;
		} else if(GlobalMethodService.isEmptyString($scope.user.password)) {
			notificationService.error("Password is required.");
			return;
		}
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
		
		$scope.forgotPassword = function(ev) {
			$mdDialog.show({
				controller : function($scope, $mdDialog, notificationService, GlobalMethodService, PasswordService) {
					$scope.user = {};
					$scope.showOTP = true;
					$scope.close = function(result) {
						if(result != null) {
							$mdDialog.hide(result);
						} else {
							$mdDialog.cancel();
						}
					}

					$scope.sendOTP = function() {
						if (GlobalMethodService.isEmptyString($scope.user.username)) {
							notificationService.error("Username is required.");
							return;
						}
						PasswordService.generateLoginOTP({username: $scope.user.username}, function(data) {
								$scope.showOTP = false;
								notificationService.success("An OTP has been sent to your registered number.");
						}, function(error) {
								notificationService.error("No user found for the given Username.");
								return;
						})
					}

					$scope.updatePassword = function() {
						if(GlobalMethodService.isEmptyString($scope.user.OTP)) {
							notificationService.error('OTP is required.')
							return;
						}
						if(GlobalMethodService.isEmptyString($scope.user.password)) {
							notificationService.error('Password is required.')
							return;
						}
						if(GlobalMethodService.isEmptyString($scope.user.confirmPassword)) {
							notificationService.error('Confirm Password is required.');
							return;
						}
						if(!angular.equals($scope.user.password, $scope.user.confirmPassword)) {
							notificationService.error('Both password should be same.');
							return;
						}
						PasswordService.updateUserPassword($scope.user, function(data) {
							notificationService.success("Password changed successfully.");
							$scope.close();
						}, function(error) {
							notificationService.error(error.data.message);
						})
					}
				},
					templateUrl: 'forgotPassword.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				})
				.then(function(answer) {
				}, function() {
			});
		}
    $scope.init();
}])
