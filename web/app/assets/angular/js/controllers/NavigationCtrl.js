var NavigationCtrl = GMApp.controller('NavigationCtrl', ['$scope', '$rootScope', 'ipCookie', '$state', function($scope, $rootScope, ipCookie, $state){
    $scope.toggleNavbar = function() {
      	if($("body").hasClass("sidenav-toggled")) {
			ipCookie('appSideBar', true, { expires: 2 });
        	$('.userImage').show();
      	} else {
			ipCookie('appSideBar', false, { expires: 2 });
        	$('.userImage').hide();
     	}
		$("body").toggleClass("sidenav-toggled");
		if($state.current.name.indexOf('home') >= 0) {
			$state.go($state.current.name, $state.params, { reload: true });
		}
    }

    $scope.showUserImage = function() {
      	if($("body").hasClass("sidenav-toggled")) {
        	return false;
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
