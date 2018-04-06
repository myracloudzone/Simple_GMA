var AttendanceCtrl = GMApp.controller('AttendanceCtrl', ['$scope', '$rootScope', '$mdDialog', 'notificationService', 'AttendanceService', 'GlobalMethodService', function($scope, $rootScope, $mdDialog, notificationService, AttendanceService, GlobalMethodService){
    $scope.init = function() {
        $scope.showReportSection = false;
        $scope.toggleCameraSection();
    }

    $scope.toggleCameraSection = function() {
        $scope.cameraRequested = !$scope.cameraRequested;
        $scope.showCamera = !$scope.showCamera;
    }
    
    $scope.startScanner = function() {
        $scope.cameraRequested = true;
    }

    $scope.toggleReportSection = function() {
        $scope.showReportSection = !$scope.showReportSection;
    }

    $scope.init();

    $scope.stopScanner = function() {
        $scope.cameraRequested = false;
    }

    $scope.getData = function() {
        var payload = {};
        payload.type = 'Member';
        payload.filterDate = moment().format('DD/MM/YYYY');
        AttendanceService.getHistory(payload, function(data) {
            $scope.attendanceData = data.data;
        }, function(error) {

        });
    }

    $scope.getData();
    
    $scope.processURLfromQR = function (text) {
        if(GlobalMethodService.isEmptyString(text)) {
            return;
        }
        //webcam-live
        $scope.cameraProcessing = true;
        text = text.replace('L:', 'M_');
        text = text.replace('T:', 'U_');
        var obj = {};
        obj.checkInTime = moment().format('DD/MM/YYYY HH:mm');
        obj.regCode = text;
        GlobalMethodService.showLoader();
        AttendanceService.checkIn(obj, function(data) {
            $scope.showCamera = false;
            $scope.checkInMember = data.data;
            notificationService.success("Checked In Successfully");
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.showCamera = true;
                    GlobalMethodService.hideLoader();
                    $scope.cameraProcessing = false;
                })
            }, 500)
        }, function(error) {
            $scope.showCamera = false;
            notificationService.error(error.data);
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.showCamera = true;
                    GlobalMethodService.hideLoader();
                    $scope.cameraProcessing = false;
                })
            }, 500)
        });            
    }

    $scope.showDetails = function(ev, data) {
		var dialog = $mdDialog.show({
        	controller : function($scope, $mdDialog, GlobalMethodService) {
                $scope.record = data;
				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				}
        	},
        	templateUrl: 'attendanceDetail.html',
        	parent: angular.element(document.body),
        	targetEvent: ev,
        	clickOutsideToClose:true,
        	fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      	})
      	.then(function(answer) {
        	$scope.refresh();
      	}, function() {
		});
		$rootScope.dialogList.push(dialog);
	};
}])