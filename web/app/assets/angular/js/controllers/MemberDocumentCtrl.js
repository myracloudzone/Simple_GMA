var MemberDocumentCtrl = GMApp.controller('MemberDocumentCtrl', ['$scope', '$mdDialog', '$filter', 'notificationService', 'GlobalMethodService', 'GlobalVariableService', 'MemberService','UploadService', 'member', function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, MemberService, UploadService, member){
    $scope.documents = [];
    $scope.member = member;
    $scope.fileUploadUrl = '/service/upload/member_docs';
    $scope.fileTypesForUpload = 'jpg,jpeg,png,doc,docx,xls,xlxs,ppt,pdf,txt';
    $scope.listView = false;

    $scope.getMemberDocuments = function() {
        $scope.listView = true;
        $scope.loading = true;
        MemberService.documents({memberId : $scope.member.id}, function(data) {
            if(data != null) {
                $scope.documents = data;
            }
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
        })
    }

    $scope.deleteFile = function(filePath) {
        UploadService.deleteFile({'filePath' : filePath}, function(data) {
            notificationService.success('Deleted Successfully.');
            $scope.getMemberDocuments();
        }, function(error) {
            notificationService.error('Error occurred while deleting.');
        })
    }

    $scope.close = function(result) {
        if(result != null) {
            $mdDialog.hide(result);
        } else {
            $mdDialog.cancel();
        }
    };

    $scope.updateUploadedDocument = function(response) {
        if(response.status == 200) {
            notificationService.success('File Uploaded Successfully.');
        } else {
            notificationService.error('Error occurred while uploading file.');
        }
    }

    $scope.getFileType = function(fileName) {
        if(GlobalMethodService.isEmptyString(fileName)) {
            return 1;
        }
        if(fileName.toLowerCase().endsWith('png') || fileName.toLowerCase().endsWith('jpg') || fileName.toLowerCase().endsWith('jpeg') || fileName.toLowerCase().endsWith('ico')) {
            return 2;
        } else {
            return 1;
        }
    }
}])
