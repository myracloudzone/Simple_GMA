var GroupCtrl = GMApp.controller('GroupCtrl', ['$scope', '$rootScope', '$mdDialog', 'GroupService','notificationService', function($scope, $rootScope, $mdDialog, GroupService, notificationService){
	$scope.groups = [];
	$scope.listLoading = true;
    $scope.init = function() {
		$scope.listLoading = true;
      	GroupService.list({accountId : 1}, function (data) {
        	if(data != null) {
		  		$scope.groups = data;
			}
			$scope.listLoading = false;
      	});
    }
	
	$scope.refresh = function() {
        $scope.groups = [];
        $scope.init();
    }

    $scope.delete = function(id) {
      	GroupService.deleteGroupById({accountId : 1, 'id': id}, function (data) {
			  console.log(data);
			notificationService.success(data.response);
			$scope.refresh();
      	});
    }

    $scope.editItem = function(ev, id) {
		if(id == null || id == '') {
			if($scope.groups.length >= 10) {
				notificationService.info("You are only add upto 10 groups.")
				return false;
			}
		}		
     	$mdDialog.show({
        	controller : function($scope, $mdDialog, GroupService, GlobalMethodService) {
				$scope.icons = ["/media/1/icons/dumbell.png","/media/1/icons/heart.png",
                          "/media/1/icons/running1.png","/media/1/icons/yoga.png",
                          "/media/1/icons/biking.png"];
				$scope.group = {icon_url : $scope.icons[0]};  
				$scope.setIcon = function(icon) {
					$scope.group.icon_url = icon;
				}
				$scope.getById = function(id) {
					GroupService.getById({'id' : id}, function (data) {
					if(data != null) {
						$scope.group = data;
						$scope.loading = false;
					}
					}, function(error) {

					});
				}
				if(id != null && id != '') {
					$scope.loading = true;
					$scope.getById(id);
				}
				$scope.validateData = function() {
					if(GlobalMethodService.isEmptyString($scope.group.name)) {
						notificationService.error("Name is required.");
						return false;
					}
					return true;
				}

				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				}

				$scope.addGroup = function() {
					if(!$scope.validateData()) {
						return;
					}
					$scope.loading = true;
					GroupService.addEditGroup($scope.group, function (data) {
						notificationService.success("Saved Successfully.");
						$scope.close(data);
					}, function(error) {
						if(error.status == 400) {
							$scope.loading = false;
							notificationService.error(error.data);
						} else {
							$scope.loading = false;
							notificationService.error("Error occured while saving.");
						}
					});
				}
        	},
        	templateUrl: 'addGroup.html',
        	parent: angular.element(document.body),
        	targetEvent: ev,
        	clickOutsideToClose:true,
        	fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      	})
      	.then(function(answer) {
        	$scope.refresh();
      	}, function() {
      	});
	}
	
	$scope.init();
}])
