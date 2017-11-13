var NavigationCtrl = GMApp.controller('NavigationCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
    $scope.toggleNavbar = function() {
      	if($("body").hasClass("sidenav-toggled")) {
        	$('.userImage').show();
      	} else {
        	$('.userImage').hide();
     	}
      	$("body").toggleClass("sidenav-toggled");
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
