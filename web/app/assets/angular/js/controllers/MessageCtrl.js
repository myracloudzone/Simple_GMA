var MessageCtrl = GMApp.controller('MessageCtrl', ['$scope', '$rootScope', '$mdDialog', 'MemberService', 'notificationService', 'GlobalMethodService', 'SmsService', '$filter', function($scope, $rootScope, $mdDialog, MemberService, notificationService, GlobalMethodService, SmsService, $filter){
	$scope.sentMessages = [];
	$scope.history = { type : 1};
	$scope.getSentMessageHistory = function() {
		$scope.loading = true;
		SmsService.getSentMesssageHistory({accountId : $rootScope.accountId, messageType : $scope.history.type}, function(data) {
			$scope.sentMessages = data.data;
			$scope.loading = false;
		}, function(error) {
			$scope.loading = false;
		})
	};
	
	$scope.$watch('history.type', function (newVal, oldVal) {
		if (oldVal == newVal) return;
		$scope.getSentMessageHistory();
	}, true);

	$scope.getSentMessageHistory();

	$scope.getDateString = function(date) {
		if(date == null || date == '') {
			return '';
		}
		date = new Date(parseInt(date));
		return $filter('date')(date, 'dd/MM/yyyy');
	}

    $scope.add = function(ev, id) {
      $mdDialog.show({
        controller : function($scope, $mdDialog){
			$scope.message = {};
			$scope.isSmsMode = false;
			$scope.tinymceOptions = {
				plugins: 'link image code',
				toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
			};

			$scope.close = function(result) {
				if(result != null) {
					$mdDialog.hide(result);
				} else {
					$mdDialog.cancel();
				}
			}
			  
          	$scope.getMembers = function() {
              	$scope.sortOrder = 'ASC';
              	$scope.sortField = 'first_name';
              	MemberService.list({page : 1, pageSize : 99999, active : true, sortOrder : $scope.sortOrder, sortField : $scope.sortField}, function(data) {
                  	if(data != null && data.data != null) {
                    	$scope.members = data.data;
                  	}
              	}, function(err) {
                  
              	})
			};

			$scope.$watch('message.selectedMember', function (newVal, oldVal) {
				if (oldVal == newVal) return;
				var numbers = [];
				var emails = [];
				angular.forEach($scope.message.selectedMember, function(v,k) {
					var temp = JSON.parse(v);
					numbers.push(temp.mobile);
					emails.push(temp.email);
				});
				$scope.message.memberMobile =  numbers.toString();
				$scope.message.memberEmail =  emails.toString();
			}, true);
			
			$scope.getMembers();

			$scope.sendMessage = function() {
				if($scope.isSmsMode) {
					var membersData = [];
					angular.forEach($scope.message.selectedMember, function(v,k) {
						var temp = JSON.parse(v);
						var obj = {};
						obj.memberId = temp.id;
						obj.mobile = temp.mobile;
						membersData.push(obj);
					});
					var sendObject = {};
					sendObject.smsContent = $scope.message.smsContent;
					sendObject.memberData = membersData;
					if(sendObject.memberData == null || sendObject.memberData.length == 0) {
						notificationService.error("Please select a member to continue.");
						return;
					}
					if(GlobalMethodService.isEmptyString(sendObject.smsContent)) {
						notificationService.error("Please enter message text to continue.");
						return;
					}
					SmsService.sendGroupMessage(sendObject, function(data) {
						notificationService.success("Sent Successfully.");
						$scope.close(data);
					}, function(error) {
						notification.error(error.data);
					});
				} else {
					var membersData = [];
					angular.forEach($scope.message.selectedMember, function(v,k) {
						var temp = JSON.parse(v);
						var obj = {};
						obj.memberId = temp.id;
						obj.email = temp.email;
						membersData.push(obj);
					});
					var sendObject = {};
					sendObject.emailContent = $scope.message.emailContent.msg;
					sendObject.emailSubject = $scope.message.emailContent.subject;
					sendObject.memberData = membersData;
					if(sendObject.memberData == null || sendObject.memberData.length == 0) {
						notificationService.error("Please select a member to continue.");
						return;
					}
					if(GlobalMethodService.isEmptyString(sendObject.smsContent)) {
						notificationService.error("Please enter message text to continue.");
						return;
					}
					SmsService.sendGroupMessage(sendObject, function(data) {
						notificationService.success("Sent Successfully.");
						$scope.close(data);
					}, function(error) {
						notification.error(error.data);
					});
				}
			}
        },
        templateUrl: 'messageAdd.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
        $scope.status = 'You cancelled the dialog.';
    });
}
	$scope.init = function(){
        //write all init processes here
    }
    $scope.init();
}])
