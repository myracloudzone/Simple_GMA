var MembershipDialogCtrl = GMApp.controller('MembershipDialogCtrl', ['$scope', '$mdDialog', '$filter', 'notificationService', 'GlobalMethodService', 'GlobalVariableService', 'MemberService','EmailService', 'SmsService', 'GroupService', 'PlanService', 'MembershipService', 'member', function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, MemberService, EmailService, SmsService, GroupService, PlanService, MembershipService, member){
    $scope.member = member;
    console.log($scope.member)
    $scope.membershipChangeNotAllowed = true;
    $scope.membership = { name : $scope.member.firstName + ' ' + $scope.member.lastName, currentPlanId : $scope.member.planId, currentMembershipEndDate : $scope.member.membershipEndDate, currentMembershipStartDate : $scope.member.membershipStartDate , isSignUpFee : false };
    
    MembershipService.checkForMembershipUpgrade({memberId : $scope.member.id}, function(data) {
        if(data != null) {
            $scope.membershipChangeNotAllowed = !data.isAllowed;
            if(data.isAllowed == false) {
                notificationService.info(data.message);
            }
        }
    });
    $scope.close = function(result) {
        if(result != null) {
            $mdDialog.hide(result);
        } else {
            $mdDialog.cancel();
        }
    };

    $scope.updateMembership = function(ev) {
        var data = {};
        data.memberId = $scope.member.id;
        data.membershipPlanType = $scope.membership.membershipPlanType;
        data.planId = $scope.membership.planId;
        data.ratePlanId = $scope.membership.ratePlanId;
        data.isSignUpFee = $scope.membership.isSignUpFee;
        if(GlobalMethodService.isEmptyString(data.planId)) {
            notificationService.error("New Membership Plan is required.")
            return;
        }
        if(data.planId == $scope.membership.currentPlanId) {
            notificationService.info('Please select a new membership to change.');
            return;
        }

        console.log(data);
        MembershipService.updateMembershipOfMember(data, function(response) {
            if(response != null) {
                if(response.actionStatus == 101) {
                    var confirm = $mdDialog.confirm()
                    .title()
                    .textContent(response.actionStatusMessage)
                    .ariaLabel('Refund')
                    .targetEvent(ev)
                    .ok('Please refund it!')
                    .cancel('Cancel');
                    $mdDialog.show(confirm).then(function() {
                        MembershipService.refundAmount({memberId : $scope.member.id}, function(response) {
                            if(response != null) {
                                notificationService.success("Successfully Updated.");
                                $scope.close(response);
                            } else {
                                notificationService.error("Error Occurred.");
                                $scope.close(response);
                            }
                        });
                    }, function() {
                        notificationService.success("Successfully Updated.");
                        $scope.close({msg : 'Close'});
                    });
                } else {
                    notificationService.success("Successfully Updated.");
                    $scope.close(response);
                }
            }
        });
    }

    $scope.getMembershipPlanName = function(id) {
		var name = '';
		angular.forEach($scope.plans, function(v,k) {
			if(v.id == id) {
				name = v.name;
			}
		})
		return name;
    }
    
    $scope.getDateString = function(date) {
		if(date == null || date == '') {
			return '';
		}
		date = new Date(parseInt(date));
		return $filter('date')(date, 'dd/MM/yyyy');
	}

    $scope.initPlans = function() {
		$scope.plans = [];
		PlanService.list({page : 1, pageSize : 10000}, function (data) {
        	if(data != null) {
				$scope.plans = data.data;
        	}
      	}, function(error) {
        	$scope.plans = [];
     	});
	}
    $scope.initPlans();
    
    $scope.changeRatePlan = function(plan) {
        $scope.membership.ratePlanId = plan.ratePlanId;
        $scope.membership.membershipPlanType = plan.typeId;
    }

}])
