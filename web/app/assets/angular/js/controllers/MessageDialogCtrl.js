var MessageDialogCtrl = GMApp.controller('MessageDialogCtrl', ['$scope', '$mdDialog', '$filter', 'notificationService', 'GlobalMethodService', 'GlobalVariableService', 'MemberService','EmailService', 'SmsService', 'member', function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, MemberService, EmailService, SmsService, member){
    $scope.member = member;
    $scope.isSmsMode = true;
    $scope.loading = false;
    $scope.tinymceOptions = {
        plugins: 'link image code',
        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
      };

    $scope.init = function() {
        $scope.message = {};
        $scope.message.memberName = $scope.member.firstName + ' ' + $scope.member.lastName;
        $scope.message.memberId = $scope.member.id;
        $scope.message.memberMobile = $scope.member.mobile;
        $scope.message.memberEmail = $scope.member.email;
        $scope.message.emailContent = {msg : 'Hi <b>' + $scope.message.memberName + ',<b><br/><br/><br/><br/><br/>Thank You!!'};
    }
    $scope.validateEmailContent = function() {
        if(GlobalMethodService.isEmptyString($scope.message.memberEmail)) {
            notificationService.error('Email is required.');
            return false;
        } else if(GlobalMethodService.isEmptyString($scope.message.emailContent.subject)) {
            notificationService.error('Subject is required.');
            return false;
        } else if(GlobalMethodService.isEmptyString($scope.message.emailContent.msg)) {
            notificationService.error('Msg is required.');
            return false;
        }
        return true;
    }

    $scope.validateSmsContent = function() {
        if(GlobalMethodService.isEmptyString($scope.message.memberMobile)) {
            notificationService.error('Mobile No. is required.');
            return false;
        } else if(GlobalMethodService.isEmptyString($scope.message.smsContent)) {
            notificationService.error('Message is required.');
            return false;
        }
        return true;
    }

    $scope.sendMessage = function() {
        if($scope.isSmsMode == false) {
            if(!$scope.validateEmailContent()) {
                return;
            }
            var msgObject = {};
            msgObject.to = $scope.message.memberEmail;
            msgObject.subject = $scope.message.emailContent.subject;
            msgObject.msg = $scope.message.emailContent.msg;
            msgObject.memberId = $scope.message.memberId;
            $scope.loading = true;
            EmailService.sendEmail(msgObject, function(data) {
                notificationService.success("Email Sent.");
                $scope.close();
            }, function(error) {
                if(error.status == 400) {
                    notificationService.error(error.data);
                } else {
                    notificationService.error("Error Occurred.");
                }
                $scope.loading = false;
            });
        } else {
            if(!$scope.validateSmsContent()) {
                return;
            }
            var msgObject = {};
            msgObject.mobileNumbers = [$scope.message.memberMobile];
            msgObject.msg = $scope.message.smsContent;
            msgObject.memberId = $scope.message.memberId;
            $scope.loading = true;
            SmsService.sendMessage(msgObject, function(data) {
                notificationService.success("SMS Sent.");
                $scope.close();
            }, function(error) {
                if(error.status == 400) {
                    notificationService.error(error.data);
                } else {
                    notificationService.error("Error Occurred.");
                }
                $scope.loading = false;
            });
        }
    }

    $scope.init();

    $scope.close = function(result) {
        if(result != null) {
            $mdDialog.hide(result);
        } else {
            $mdDialog.cancel();
        }
    };
}])
