var HomeCtrl = GMApp.controller('HomeCtrl', ['$scope', '$rootScope', '$stateParams', function($scope, $rootScope, $stateParams){
    console.log($stateParams)
    $scope.init = function(){
        //write all init processes here
    }
    $scope.init();
}])
