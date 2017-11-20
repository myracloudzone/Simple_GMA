var NavigationCtrl = GMApp.controller('NavigationCtrl', ['$scope', '$rootScope', 'ipCookie', '$state', '$mdDialog', 'UserService', function($scope, $rootScope, ipCookie, $state, $mdDialog, UserService){
    $scope.toggleNavbar = function() {
      	if($("body").hasClass("sidenav-toggled")) {
			ipCookie('appSideBar', true, { expires: 2 });
        	// $('.userImage').show();
      	} else {
			ipCookie('appSideBar', false, { expires: 2 });
        	// $('.userImage').hide();
     	}
		$("body").toggleClass("sidenav-toggled");
		$('.userImage').show();
		if($state.current.name.indexOf('home') >= 0) {
			$state.go($state.current.name, $state.params, { reload: true });
		}
	}
	
	$scope.changePassword = function(ev) {
		$(".navbar-toggler").trigger( "click" );
		var dialog = $mdDialog.show({
			controller : function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, UserService) {
				$scope.loading = true;
				$scope.getLoggedInUser = function() {
					$scope.loading = true;
					UserService.getLoggedInUser({}, function(data) {
						$scope.user = data;
						$scope.loading = false;
					});
				};
				$scope.getLoggedInUser();
				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				};

				$scope.validate = function() {
					if(GlobalMethodService.isEmptyString($scope.user.currentPassword)) {
						notificationService.error('Current Password is required.');
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.user.newPassword)) {
						notificationService.error('New Password is required.');
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.user.confirmPassword)) {
						notificationService.error('Confirm Password is required.');
						return false;
					} else if (!angular.equals($scope.user.newPassword,$scope.user.confirmPassword)) {
						notificationService.error('New password doesn\'t match.');
						return false;
					}
					return true;
				}

				$scope.save = function() {
					if(!$scope.validate()) {
						return;
					}
					$scope.loading = true;
					delete $scope.user.confirmPassword;
					UserService.changePassword($scope.user, function(data) {
						notificationService.success("Password changed successfully.");
						$scope.close();
					}, function(error) {
						console.log(error)
						$scope.loading = false;
						notificationService.error(error.data.errorMessage);
					});
				}
			},
			templateUrl: '/app/assets/angular/views/passwordChange.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
			},
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
				// $('.navbar-toggler').removeClass('collapsed');
			}, function() {
				// $('.navbar-toggler').removeClass('collapsed');
			}
		);
		$rootScope.dialogList.push(dialog);
	};

    $scope.showUserImage = function() {
      	if($("body").hasClass("sidenav-toggled")) {
        	return true;
      	} else {
        	return true;
      	}
    }

	$('.settingBar').addClass('show');

    $scope.scrollToTop = function() {
		$('#listTable').animate({
    		scrollTop: $('html body').offset().top - 200
      	}, 500);
		$('html, body').animate({
        	scrollTop: 0
      	}, 500);
    }
}])
