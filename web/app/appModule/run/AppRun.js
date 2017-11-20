GMApp.run(['$rootScope', '$http', '$window', '$filter', 'ipCookie', '$mdDialog', 
    function ($rootScope, $http, $window, $filter, ipCookie, $mdDialog) {
		var windowWidth = window.innerWidth;
		if(windowWidth < 992) {
			$("body").removeClass("sidenav-toggled");
		} else {
			$("body").addClass("sidenav-toggled");
		}
		$(window).resize(function() {
			var winWidth = window.innerWidth;
			if(winWidth < 992) {
				$("body").removeClass("sidenav-toggled");
			} else {
				$("body").addClass("sidenav-toggled");
			}
		});
		$rootScope.dialogList = [];
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
			$rootScope.accountId = ipCookie('account');
			angular.forEach($rootScope.dialogList, function(v,k) {
				$mdDialog.hide(v);
			})
		})

		var isSideBarOpen = ipCookie('appSideBar');
		if(isSideBarOpen) {
			$("body").toggleClass("sidenav-toggled");
		}
    }
])
