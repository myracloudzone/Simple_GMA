var UsersCtrl = GMApp.controller('UsersCtrl', ['$scope', '$rootScope', 'UserService', '$mdDialog', 'notificationService', function($scope, $rootScope, UserService, $mdDialog, notificationService){
    $scope.users = [];
    $scope.pageCount = 0;
    $scope.pageLimit = 10;
    $scope.sortOrder = 'ASC';
	$scope.sortField = 'name';
	$scope.descendingOffImagePath = "/app/assets/angular/images/sort_descending_off.png";
	$scope.descendingOnImagePath = "/app/assets/angular/images/sort_descending_on.png";
	$scope.ascendingOnImagePath = "/app/assets/angular/images/sort_ascending_on.png";
	$scope.initVariables = { search : ''};
    $scope.pagination = {};
    $scope.loggedInUser = $rootScope.loggedUser;

    $scope.init = function() {
        $scope.users = [];
        UserService.list({page : $scope.pagination.page, pageSize : $scope.pageSize, search : $scope.initVariables.search, active : true, sortOrder : $scope.sortOrder, sortField : $scope.sortField}, function(data) {
            if(data != null) {
                $scope.users = data.data;
            }
            $scope.pagination.page = data.pagination.page;
            $scope.pageCount = data.pagination.pageCount;
            $scope.pagination.rowCount = data.pagination.rowCount;    
        })
    }

    $scope.delete = function(user) {
        if($rootScope.loggedUser.id == user.id) {
            notificationService.info("You cannot delete youself.");
            return;
        }
        if(user.roleId == 1) {
            notificationService.info("Root User cannot be deleted.");
            return;
        }
        UserService.deleteUser({id : user.id}, function(data) {
            notificationService.success("Successfully Deleted.");
            $scope.init();
        }, function(error) {
            notificationService.error(error.data);
        })
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
    
    $scope.addUser = function(ev, id) {
        var dialog = $mdDialog.show({
          controller : function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, UserService){
                $scope.calendar = { minDate : new Date('01/01/1901'), maxDate : new Date('01/12/2099') };  
                $scope.user = { roleId : 2 };
                $scope.loading = true;
                $scope.close = function(result) {
                    if(result != null) {
                        $mdDialog.hide(result);
                    } else {
                        $mdDialog.cancel();
                    }
                }
                if(id != null) {
                    UserService.getUser({id : id}, function(data) {
                        $scope.user = data;
                        $scope.loading = false;
                        if(!GlobalMethodService.isEmptyString($scope.user.dobString)) {
                            $scope.user.dob = new Date($scope.user.dobString);
                        } else {
                            $scope.user.dob = null;
                        }
                        if(!GlobalMethodService.isEmptyString($scope.user.joiningDateString)) {
                            $scope.user.joiningDate = new Date($scope.user.joiningDateString);
                        } else {
                            $scope.user.joiningDate = null;
                        }
                    }, function(error) {
                        $scope.loading = false;
                    });
                } else {
                    $scope.loading = false;
                }

                $scope.validate = function() {
                    if(GlobalMethodService.isEmptyString($scope.user.name)) {
                        notificationService.error("Name is required.");
                        return false;
                    } else if(GlobalMethodService.isEmptyString($scope.user.email)) {
                        notificationService.error("Email is required.");
                        return false;
                    } else if(GlobalMethodService.isEmptyString($scope.user.mobile)) {
                        notificationService.error("Mobile is required.");
                        return false;
                    } else if($scope.user.dob != null && $scope.user.dob.getTime() >= (new Date()).getTime()) {
						notificationService.error("Invalid Birthday Date.");
						return false;
					} else if($scope.user.joiningDate != null && $scope.user.joiningDate.getTime() >= (new Date()).getTime()) {
						notificationService.error("Invalid Joining Date.");
						return false;
					} 	
                    return true;
                }
                $scope.createUser = function() {
                    if(!$scope.validate()) {
                        return;
                    }
                    var obj = {};
                    obj = angular.copy($scope.user);
                    obj.dobString = $filter('date')($scope.user.dob, GlobalVariableService.globalDateFormat);
                    obj.joiningDateString = $filter('date')($scope.user.joiningDate, GlobalVariableService.globalDateFormat);
                    if(id == null) {
                        obj.id = id;
                        UserService.createUser(obj, function(data) {
                            notificationService.success("Saved Successfully.");
                            $scope.close(data);
                        }, function(error) {
                            notificationService.error(error.data);
                        })
                    } else {
                        UserService.updateUser(obj, function(data) {
                            notificationService.success("Saved Successfully.");
                            $scope.close(data);
                        }, function(error) {
                            notificationService.error(error.data);
                        })
                    }
                };

            },
            templateUrl: 'addUser.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
            },
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          $scope.init();
        }, function() {
          
        });
        $rootScope.dialogList.push(dialog);
    };
    $scope.init();
}])
