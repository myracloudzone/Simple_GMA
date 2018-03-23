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
			console.log(ipCookie('loggedUser'));
			if(ipCookie('loggedUser') != null && ipCookie('loggedUser') != '') {
				$rootScope.loggedUser = ipCookie('loggedUser'); 
			}
			angular.forEach($rootScope.dialogList, function(v,k) {
				$mdDialog.hide(v);
			})
		})

		if(window.navigator.platform.toLowerCase().indexOf('mac') < 0) {
			var link = document.createElement( "link" );
			link.href = location.protocol+'//'+location.host+'/app/assets/angular/css/customScrollBar.css'
			link.type = "text/css";
			link.rel = "stylesheet";
			link.media = "screen,print";
			document.getElementsByTagName( "head" )[0].appendChild( link );
		}

		var isSideBarOpen = ipCookie('appSideBar');
		if(isSideBarOpen) {
			$("body").toggleClass("sidenav-toggled");
		}
    }
])
