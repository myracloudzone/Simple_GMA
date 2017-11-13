var AdvancedCtrl = GMApp.controller('AdvancedCtrl', ['$scope', '$rootScope', '$mdDialog', function($scope, $rootScope, $mdDialog){
    $scope.init = function(){
        //write all init processes here
    }
    $scope.init();

    $scope.addItem = function(ev) {
        $mdDialog.show({
        	controller : function($scope, $mdDialog, GroupService, GlobalMethodService, notificationService, CustomFieldService) {
                $scope.types = [{id : 1, name : 'TEXT'}, {id : 2, name : 'FILE'}, {id : 3, name : 'TEXTAREA'}, {id : 4, name : 'RADIO'}, {id : 5, name : 'CHECKBOX'}, {id : 6, name : 'SELECT'}, {id : 7, name : 'MULTI_SELECT'}];
				$scope.field = {class: 'col-sm-6', required : 1, response: []};
                $scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				}
                $scope.addOption = function() {
                    if($scope.field.response.length >= 10) {
                        notificationService.info("You can only add upto 10 options.");
                        return;
                    }
                    $scope.field.response.push({name : null, code : null, value : null});
                }
                $scope.removeOption = function(index) {
                    
                    $scope.field.response.splice(index, 1)
                }
                $scope.resetResponse = function() {
                    if($scope.field.typeId == 1 || $scope.field.typeId == 2 || $scope.field.typeId == 3) {
                        $scope.field.response = [];
                    } else {
                        $scope.field.response = [];
                        $scope.field.response.push({name : null, code : null, value : null});
                        $scope.field.response.push({name : null, code : null, value : null});
                    }
                }

                $scope.isValid = function() {
                    if(GlobalMethodService.isEmptyString($scope.field.typeId)) {
                        notificationService.error("Type is required.");
                        return false;
                    } else if(GlobalMethodService.isEmptyString($scope.field.name)) {
                        notificationService.error("Name is required.");
                        return false;
                    } else if(GlobalMethodService.isEmptyString($scope.field.code)) {
                        notificationService.error("Code is required.");
                        return false;
                    } 
                    if($scope.field.typeId == 7 || $scope.field.typeId == 4 || $scope.field.typeId == 5 || $scope.field.typeId == 6) {
                        if($scope.field.response == null || $scope.field.response.length == 0) {
                            notificationService.error("Atleast one option is required.");
                            return false;
                        }
                        var uniqueCode = [];
                        var valid = true;
                        angular.forEach($scope.field.response, function(v,k) {
                            if(valid) {
                                if(GlobalMethodService.isEmptyString(v.name)) {
                                    valid = false;
                                    notificationService.error("Option Name is required for option "+(k+1)+".");
                                } else if(GlobalMethodService.isEmptyString(v.code)) {
                                    valid = false;
                                    notificationService.error("Option Code is required for option "+(k+1)+".");
                                } else if(GlobalMethodService.isEmptyString(v.value)) {
                                    valid = false;
                                    notificationService.error("Option Value is required for option "+(k+1)+".");
                                } else {
                                    if(uniqueCode.indexOf(v.code) >= 0) {
                                        valid = false;
                                        notificationService.error("Unique Code is required for option "+(k+1)+".");
                                    } else {
                                        uniqueCode.push(v.code);
                                    }
                                }
                            }
                        })
                        if(!valid) {
                            return false;
                        }
                    }
                    return true;    
                }
                $scope.save = function() {
                    console.log($scope.field)
                    if(!$scope.isValid()) {
                        return;
                    }
                    $scope.field.module_id = 1;
                    CustomFieldService.createField($scope.field, function(data) {
                        console.log(data);
                    })                    
                }
        	},
        	templateUrl: 'addCustomField.html',
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
}])