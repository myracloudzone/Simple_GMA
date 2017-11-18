var PlanCtrl = GMApp.controller('PlanCtrl', ['$scope', '$rootScope','$mdDialog','$filter','PlanService', 'GlobalMethodService', 'notificationService','$state','$stateParams', function($scope, $rootScope,  $mdDialog, $filter, PlanService, GlobalMethodService, notificationService, $state, $stateParams){
    console.log($stateParams)
	$scope.customFullscreen = false;
    $scope.plans = [];
	$scope.planTypes = [{id: null, name: 'None'},{id: 1, name: 'Daily'},{id: 2, name: 'Weekly'},{id: 3, name: 'Monthly'},{id: 4, name: 'Quarterly'},{id: 5, name: 'Half-Yearly'},{id: 6, name: 'Yearly'}];
    $scope.page = 1;
	$scope.pageSize = 10;
	$scope.pageCount = 0;
	$scope.rowCount = 0;
	$scope.pagination = {page : 1};
	$scope.getList = function() {
      	$scope.listLoading = true;
     	PlanService.list({'accountId' : 1, page : $scope.pagination.page, pageSize : $scope.pageSize}, function (data) {
        	if(data != null) {
				$scope.plans = data.data;
				$scope.pagination.page = data.pagination.page;
				$scope.pageCount = data.pagination.pageCount;
				$scope.rowCount = data.pagination.rowCount;
        	}
        	$scope.listLoading = false;
      	}, function(error) {
        	$scope.listLoading = false;
     	});
    }
    $scope.getList();

	$scope.fetchData = function() {
		$scope.getList();
	}

	$scope.getDateString = function(date) {
		if(date == null || date == '') {
			return '';
		}
		date = new Date(date);
		return $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
	}

	$scope.getPlanTypeName = function(typeId) {
		var name = "";
		angular.forEach($scope.planTypes, function(v) {
			if(v.id == typeId) {
				name = v.name;
			}
		})
		return name;
	}

	$scope.refresh = function() {
		$scope.getList();
	}

    $scope.editItem = function(ev, id) {
      	$mdDialog.show({
			controller : function($scope, $mdDialog, PlanService, notificationService,GlobalMethodService){
				$scope.planTypes = [{id: null, name: 'None'}, {id: 3, name: 'Monthly'},{id: 4, name: 'Quarterly'},{id: 5, name: 'Half-Yearly'},{id: 6, name: 'Yearly'}];
				$scope.loading = true;
				$scope.plan = {};
				$scope.getObject = function() {
					if(id != null) {
						PlanService.getPlanById({'id' : id}, function (data) {
							if(data != null) {
								$scope.plan = data;
								$scope.planBackup = angular.copy(data);
							}
							$scope.loading = false;
						}, function(error) {
							// Append Error
						});
					} else {
						$scope.loading = false;
					}
				}
				$scope.getObject();

				$scope.validateObject = function() {
					if(GlobalMethodService.isEmptyString($scope.plan.name)) {
						notificationService.error("Name is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.plan.amount)) {
						notificationService.error("Fee is required.");
						return false;
					} else if($scope.plan.amount < 0) {
						notificationService.error("Fee should be greater than equal to 0.");
						return false;
					} else if(!GlobalMethodService.isEmptyString($scope.plan.signup_fee) && $scope.plan.signup_fee < 0) {
						notificationService.error("Signup Fee should be greater than equal to 0.");
						return false;
					} else if(!GlobalMethodService.isEmptyString($scope.plan.description) && $scope.plan.description.length > 255) {
						notificationService.error("Max limit for description is 255 char.");
						return false;
					} 
					else if(GlobalMethodService.isEmptyString($scope.plan.typeId)) {
						notificationService.error("Type is required.");
						return false;
					}
					return true;
				}

				$scope.save = function() {
					if(!$scope.validateObject()) {
						return;
					}
					$scope.loading = true;
					if($scope.plan.id != null) {
						if(($scope.planBackup.amount != $scope.plan.amount) || ($scope.planBackup.signup_fee != $scope.plan.signup_fee)) {
							$scope.plan.isNewEntry = true;
						}
						PlanService.updatePlan($scope.plan, function(data) {
							notificationService.success("Successfully Saved.");
							$scope.close(data);
						}, function(error) {
							$scope.loading = false;
							notificationService.error("Error Occured.")
						})
					} else {
						PlanService.addPlan($scope.plan, function(data) {
							notificationService.success("Successfully Saved.");
							$scope.close(data);
						}, function(error) {
							$scope.loading = false;
							notificationService.error("Error Occured.")
						})
					}
				}
				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				}
			},
			templateUrl: 'editSubscription.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    	})
      	.then(function(answer) {
        	$scope.getList();
      	}, function() {
      	});
    };

    
   	$scope.deleteItem = function(ev, id) {
      	var confirm = $mdDialog.confirm()
            .title('Would you like to delete this plan?')
            .textContent('')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel');
      	$mdDialog.show(confirm).then(function() {
        	PlanService.deletePlanById({'id' : id}, function (data) {
				$scope.refresh();
				notificationService.success("Deleted Successfully.");
			}, function(error) {
				notificationService.error("Error Occurred.");
			});
      	}, function() {
        
      	});
  	};
    $scope.init = function(){
        //write all init processes here
    }
    $scope.init();
}])
