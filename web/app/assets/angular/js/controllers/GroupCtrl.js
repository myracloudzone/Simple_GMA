var GroupCtrl = GMApp.controller('GroupCtrl', ['$scope', '$rootScope', '$mdDialog', 'GroupService','notificationService', function($scope, $rootScope, $mdDialog, GroupService, notificationService){
	$scope.groups = [];
	$scope.listLoading = true;
	$scope.sortOrder = 'ASC';
	$scope.sortField = 'name';
	$scope.descendingOffImagePath = "/app/assets/angular/images/sort_descending_off.png";
	$scope.descendingOnImagePath = "/app/assets/angular/images/sort_descending_on.png";
	$scope.ascendingOnImagePath = "/app/assets/angular/images/sort_ascending_on.png";
	$scope.initVariables = {};
	$scope.pageOffset = 0;
	$scope.pageLimit = 10;
	$scope.pageSize = 10;
	$scope.pagination = {page : 1, rowCount : 0};
	
	$scope.getSortImage = function(fieldName) {
		if($scope.sortField.indexOf(fieldName) < 0) {
			return $scope.descendingOffImagePath;
		} else {
			if($scope.sortOrder == "ASC") {
				return $scope.descendingOnImagePath;
			} else if($scope.sortOrder == "DESC") {
				return $scope.ascendingOnImagePath;
			} else {
				return $scope.descendingOffImagePath;
			}
		}
	}

	$scope.fetchData = function() {
		$scope.pageOffset = ($scope.pageLimit * ($scope.pagination.page -1));
		$scope.init();
	}

    $scope.init = function() {
		$scope.listLoading = true;
      	GroupService.list({accountId : 1,sortOrder : $scope.sortOrder, sortField : $scope.sortField, search : $scope.initVariables.search, pageOffset : $scope.pageOffset, pageLimit : $scope.pageLimit}, function (data) {
        	if(data != null) {
				$scope.groups = data.data;
				// $scope.pagination.page = data.pagination.page;
				$scope.pageCount = data.pagination.pageCount;
				$scope.pagination.rowCount = data.pagination.rowCount;
			}
			$scope.listLoading = false;
      	});
	}
	
	$scope.applySort = function(fieldName) {
		if($scope.sortOrder.indexOf('ASC') < 0) {
			$scope.sortOrder = 'ASC';
		} else {
			$scope.sortOrder = 'DESC';
		}
		$scope.sortField = fieldName;
		$scope.init();
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
	};

	$scope.viewMembers = function(ev, id) {
		$mdDialog.show({
        	controller : function($scope, $rootScope, $mdDialog, GroupService, MemberService, GlobalMethodService, notificationService) {
				$scope.selectedIds = {};
				$scope.selectedMemberIds = [];
				$scope.initVariables = {};
				$scope.showMembers = false;
				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				}
				$scope.addMemberToGroup = function() {
					angular.forEach($scope.allMember, function(v,k) {
						if(v.selected == true) {
							$scope.selectedIds[v.id] = true;
							$scope.selectedMemberIds.push(v.id);
							$scope.selectedMember.push(v);
						}
					})
					$scope.allMember = angular.copy($scope.copyAllMember);
					$scope.showMembers = false;
				}

				$scope.assignGroups = function() {
					var data = {};
					data.groupId = id;
					data.memberIds = $scope.selectedMemberIds;
					GroupService.assignGroupToMember(data, function(data) {
						notificationService.success("Saved Successfully.");
						$scope.close(data);
					}, function(error) {
						notificationService.error("Error Occurred.");
					})
				}
				$scope.removeMemberFromGroup = function(id) {
					$scope.selectedIds[id] = false;
					$scope.selectedMemberIds.splice($scope.selectedMemberIds.indexOf(id), 1);
					var members = [];
					angular.forEach($scope.selectedMember, function(v,k) {
						if(v.id != id) {
							members.push(v);
						}
					})
					$scope.selectedMember = angular.copy(members);
				}
				$scope.toggleMemberList = function() {
					$scope.allMember = angular.copy($scope.copyAllMember);
					$scope.showMembers = !$scope.showMembers;
				}
				$scope.getAllMembers = function() {
					var filter = {filter : {'active' : 1, accountId : $rootScope.accountId}};
					MemberService.findByFilter(filter, function(data) {
						$scope.allMember = data;
						$scope.copyAllMember = angular.copy(data);
					})
				}
				$scope.getMembersOfGroup = function() {
					var filter = {filter : {'active' : 1, group : id}};
					MemberService.findByFilter(filter, function(data) {
						$scope.selectedMember = data;
						angular.forEach($scope.selectedMember, function(v, k) {
							$scope.selectedIds[v.id] = true;
							$scope.selectedMemberIds.push(v.id);
						})
						$scope.getAllMembers();
					})
				}
				$scope.getMembersOfGroup();
				
        	},
        	templateUrl: 'groupMemberView.html',
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
