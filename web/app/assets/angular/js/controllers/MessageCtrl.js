var MessageCtrl = GMApp.controller('MessageCtrl', ['$scope', '$rootScope', '$mdDialog', function($scope, $rootScope, $mdDialog){

    $scope.add = function(ev, id) {
      $mdDialog.show({
        controller : function($scope, $mdDialog){
          $scope.close = function() {
            $mdDialog.cancel();
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
