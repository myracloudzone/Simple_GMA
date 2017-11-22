var ProductCtrl = GMApp.controller('ProductCtrl', ['$scope', '$rootScope', '$mdDialog', '$filter', 'GlobalMethodService', 'notificationService', '$state', '$stateParams', 'ProductService', function($scope, $rootScope, $mdDialog, $filter, GlobalMethodService, notificationService, $state, $stateParams, ProductService) {
    $scope.products = [];

    $scope.searchFilter = "";

    $scope.getProducts = function() {
        $scope.listLoading = true;
        ProductService.list({}, function(data) {
            $scope.listLoading = false;
            $scope.products = data;
        }, function(error) {
            $scope.listLoading = false;
        })
    }
    $scope.getProducts();

    $scope.deleteProduct = function(id) {
        ProductService.deleteProduct({id : id}, function(data) {
            notificationService.success('Deleted Successfully.');
            $scope.getProducts();
        }, function(error) {
            notificationService.error('Error Occurred.');
        })
    }

    $scope.addProduct = function(ev, id) {
        var dialog = $mdDialog.show({
                controller: function($scope, $mdDialog, $filter, GroupService, notificationService, GlobalMethodService, GlobalVariableService, ProductService) {
                    $scope.product = {};
                    $scope.loading = true;
                    $scope.close = function(result) {
                        if (result != null) {
                            $mdDialog.hide(result);
                        } else {
                            $mdDialog.cancel();
                        }
                    };
                    if(id) {
                        ProductService.getProductById({id : id}, function(data) {
                            $scope.product = data;
                            $scope.loading = false;
                        })
                    } else {
                        $scope.loading = false;
                    }
                    $scope.validateData = function() {
                        if(GlobalMethodService.isEmptyString($scope.product.name)) {
                            notificationService.error('Name is required.');
                            return false;
                        } else if(GlobalMethodService.isEmptyString($scope.product.costPrice)) {
                            notificationService.error('Cost Price is required.');
                            return false;
                        } else if(GlobalMethodService.isEmptyString($scope.product.sellingPrice)) {
                            notificationService.error('Selling Price is required.');
                            return false;
                        } else if(parseFloat($scope.product.costPrice) <= 0) {
                            notificationService.error('Cost Price should be greater than 0.');
                            return false;
                        } else if(parseFloat($scope.product.sellingPrice) <= 0) {
                            notificationService.error('Selling Price should be greater than 0.');
                            return false;
                        } else if(GlobalMethodService.isEmptyString($scope.product.quantity)) {
                            notificationService.error('Quantity is required.');
                            return false;
                        }  else if(parseFloat($scope.product.quantity) <= 0) {
                            notificationService.error('Quantity should be greater than 0.');
                            return false;
                        }
                        return true;
                    };

                    $scope.addProduct = function() {
                        
                        if(!$scope.validateData()) {
                            return;
                        }
                        $scope.loading = true;
                        if($scope.product.id == null) {
                            ProductService.addProduct($scope.product, function(data) {
                                notificationService.success('Successfully Saved.');
                                $scope.close(data);
                            }, function(error) {
                                notificationService.error('Error Occurred.');
                                $scope.loading = false;
                            })
                        } else {
                            ProductService.updateProduct($scope.product, function(data) {
                                notificationService.success('Successfully Saved.');
                                $scope.close(data);
                            }, function(error) {
                                notificationService.error('Error Occurred.');
                                $scope.loading = false;
                            })
                        }
                        
                    }
                },
                templateUrl: 'addProduct.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {

                },
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
                $scope.getProducts();
            }, function() {

            });
        $rootScope.dialogList.push(dialog);
    }
}])