var MemberCtrl = GMApp.controller('MemberCtrl', ['$scope', '$rootScope', '$mdDialog', 'GroupService', 'PlanService', 'MemberService', '$filter', 'notificationService', '$window', function($scope, $rootScope, $mdDialog, GroupService, PlanService, MemberService, $filter, notificationService, $window){
    $scope.init = function(){
        //write all init processes here
	}
	$scope.gPlace;
    $scope.init();
    $scope.initVariables = {showEditMenu : false, search : null};
	$scope.groups = [];
	$scope.plans = [];
	$scope.pageSize = 10;
	$scope.pagination = {page : 1, rowCount : 0};
	$scope.selectedmember = {id : null};
	$scope.listLoading = true;
	$scope.isFirstLoad = true;
	$scope.sortOrder = 'ASC';
	$scope.sortField = 'first_name';
	$scope.descendingOffImagePath = "/app/assets/angular/images/sort_descending_off.png";
	$scope.descendingOnImagePath = "/app/assets/angular/images/sort_descending_on.png";
	$scope.ascendingOnImagePath = "/app/assets/angular/images/sort_ascending_on.png";
	

	$scope.applySort = function(fieldName) {
		if($scope.sortOrder.indexOf('ASC') < 0) {
			$scope.sortOrder = 'ASC';
		} else {
			$scope.sortOrder = 'DESC';
		}
		$scope.sortField = fieldName;
		$scope.getMembers();
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

	$scope.setPageLayoutHeight = function() {
		setTimeout(function() {
			var remainingHeight = null;
			var winWidth = window.innerWidth;
			if($scope.selectedmember.id == null) {
				var height = $('.navbar-expand-lg').height() + $('.md-toolbar-tools').height() + 75 + $('.optionSection').height() + $('.memberSearchBox').height() + $('.paginator').height(); 
				var remainingHeight = $(window).innerHeight() - height;
			} else {
				var height = $('.navbar-expand-lg').height() + $('.md-toolbar-tools').height() + 75 + $('.optionSection').height() + $('.memberSearchBox').height() + $('.paginator').height(); 
				var remainingHeight = $(window).innerHeight() - height;
			}
			if(winWidth < 992 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				remainingHeight = remainingHeight + 40;
			}
			$(".memberTableDiv").css("height", remainingHeight + "px");
		}, 10)
	}

	angular.element(window).on("resize", function() {
        $scope.setPageLayoutHeight();
    });

	angular.element($window).bind('resize', function(){
		$scope.setPageLayoutHeight();
	});

	$scope.$watch('selectedmember.id', function() {
		$scope.setPageLayoutHeight();
	}, true)

	$scope.initGroups = function() {
		GroupService.list({accountId : 1}, function (data) {
        	if(data != null) {
		  		$scope.groups = data.data;
			}
      	});
    }
	$scope.initGroups();

	$scope.deleteMember = function(ev, id) {
		var confirm = $mdDialog.confirm()
		.title('Would you like to delete this member?')
		.textContent('')
		.ariaLabel('Delete')
		.targetEvent(ev)
		.ok('Please do it!')
		.cancel('Cancel');
	  	$mdDialog.show(confirm).then(function() {
			MemberService.deleteMember({accountId : $rootScope.accountId, id : id}, function(response) {
				notificationService.success("Deleted Successfully.");
				$scope.selectedmember.id == null;
				$scope.fetchData();
			}, function(error) {
				notificationService.error("Error Occured.");
			})
	  	}, function() {
	
	  	});
		
	}

	$scope.members = [];
	$scope.getMembers = function() {
		$scope.listLoading = true;
		$scope.selectedmember = {id : null};
		MemberService.list({page : $scope.pagination.page, pageSize : $scope.pageSize, search : $scope.initVariables.search, active : true, sortOrder : $scope.sortOrder, sortField : $scope.sortField}, function(data) {
			if(data != null && data.data != null) {
				$scope.members = data.data;
				$scope.pagination.page = data.pagination.page;
				$scope.pageCount = data.pagination.pageCount;
				$scope.pagination.rowCount = data.pagination.rowCount;
			}
			$scope.listLoading = false;	
			if(!$scope.isFirstLoad) {
				$scope.setPageLayoutHeight();
			}
			$scope.isFirstLoad = false;
		}, function(err) {
			if(!$scope.isFirstLoad) {
				$scope.setPageLayoutHeight();
			}
			$scope.isFirstLoad = false;
		})
	}

	$scope.fetchData = function() {
		$scope.getMembers();
	}

	$scope.getMemberTypeName = function(id) {
		if(id == 1) {
			return 'Normal';
		} else if(id == 2) {
			return 'Executive';
		} else if(id == 3) {
			return 'VIP';
		}
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
	
	$scope.getGroupNameById = function(id) {
		var name = '';
		angular.forEach($scope.groups, function(v,k) {
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

	$scope.getMembers();

	$scope.initPlans = function() {
		$scope.plans = [];
		PlanService.list({'accountId' : 1, page : 1, pageSize : 10000}, function (data) {
        	if(data != null) {
				$scope.plans = data.data;
        	}
      	}, function(error) {
        	$scope.plans = [];
     	});
	}
	$scope.initPlans();
	
    

    $scope.toggleEditOption = function(member) {
		$scope.selectedmember = member;
    }


    $scope.addMember = function(ev, id) {
      	var dialog = $mdDialog.show({
        	controller : function($scope, $mdDialog, $filter, GroupService, notificationService, GlobalMethodService, GlobalVariableService, MemberService,  groups, plans){
				$scope.calendar = { minDate : new Date('01/01/1901'), maxDate : new Date('01/12/2099') };  
				$scope.groups = groups;
				$scope.showPersonalDetail = true;
				$scope.planTypes = [{id: 0, name: 'None'},{id: 1, name: 'Daily'},{id: 2, name: 'Weekly'},{id: 3, name: 'Monthly'},{id: 4, name: 'Quarterly'},{id: 5, name: 'Half-Yearly'},{id: 6, name: 'Yearly'}];
				$scope.showCustomInfo = false;
				$scope.plans = plans;
				$scope.member = {memberCode : '1234567890123456', gender : 'Male'};
				$scope.showUpload = false;
				$scope.fileTypes = 'JPG,JPEG,PNG,jpeg,jpg,png';
				$scope.isPlanChangeAllowed = false;
				$scope.loading = true;
				$scope.mapsAttitude = {}; 
				$scope.showMapPopover = false;
				$scope.showVariables = {showMapPopover : false}
				$scope.mapPopover = {
					templateUrl: 'mapTemplate.html',
				};

				$scope.stopEvent = function(event) {
					event.stopPropagation();
					event.preventDefault();
				}

				$scope.toggleMapPopover = function() {
					$scope.showVariables.showMapPopover = $scope.showVariables.showMapPopover;
				}

				$scope.getObject = function() {
					if(id != null) {
						MemberService.getById({'id' : id}, function (data) {
							if(data != null) {
								$scope.member = data;
								$scope.member.birthday = new Date($scope.member.birthdayString);
								$scope.member.joiningDate = new Date($scope.member.joiningDateString);
							}
							$scope.loading = false;
						}, function(error) {
							$scope.loading = false
						});
					} else {
						$scope.loading = false;
					}
				}
				$scope.getObject();

				$scope.showUploadBox = function() {
					$scope.showUpload = !$scope.showUpload;
				}

				$scope.updateUploadedFile = function(response) {
					$scope.member.profile_pic = response.data;
				}

				$scope.isPlanChangeAllowed = function() {
					if($scope.member.id == null) {
						return false;
					}
					var s = $scope.member.joiningDate.getTime();
					var e = $scope.member.joiningDate.getTime() + 1.296e+9;
					var now = (new Date()).getTime();
					if(now > e) {
						return true;
					}
					return false;
				}
				document.addEventListener('scroll', function(event) {
					$scope.$apply(function() {
						$scope.showVariables.showMapPopover = false;
					})
				}, true);

				$scope.bc = {
					format: 'CODE128',
					lineColor: '#000000',
					width: 2,
					height: 100,
					displayValue: false,
					fontOptions: '',
					font: 'monospace',
					textAlign: 'center',
					textPosition: 'bottom',
					textMargin: 2,
					fontSize: 20,
					background: '#ffffff',
					margin: 0,
					marginTop: undefined,
					marginBottom: undefined,
					marginLeft: undefined,
					marginRight: undefined,
					valid: function (valid) {
					}
				}
				
				$scope.validateFields = function() {
					if(GlobalMethodService.isEmptyString($scope.member.firstName)) {
						notificationService.error("First Name is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.lastName)) {
						notificationService.error("Last Name is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.email)) {
						notificationService.error("Email is required.");
						return false;
					} else if(!GlobalMethodService.validateEmail($scope.member.email)) {
						notificationService.error("Invalid Email.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.gender)) {
						notificationService.error("Gender is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.birthday)) {
						notificationService.error("D.O.B is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.status)) {
						notificationService.error("Status is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.mobile)) {
						notificationService.error("Mobile is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.emergencyContactName)) {
						notificationService.error("Emergency Contact Name is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.emergencyContactNumber)) {
						notificationService.error("Emergency Contact Number is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.memberTypeId)) {
						notificationService.error("Member Type is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.planId)) {
						notificationService.error("Membership Plan is required.");
						return false;
					} else if(GlobalMethodService.isEmptyString($scope.member.joiningDate)) {
						notificationService.error("Joining Date is required.");
						return false;
					} else if($scope.member.birthday.getTime() >= (new Date()).getTime()) {
						notificationService.error("Invalid Birthday Date.");
						return false;
					} else if($scope.member.joiningDate.getTime() >= (new Date()).getTime()) {
						notificationService.error("Invalid Joining Date.");
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
				$scope.changeRatePlan = function(plan) {
					$scope.member.ratePlanId = plan.ratePlanId;
					$scope.member.membershipPlanType = plan.typeId;
				}
				$scope.save = function() {
					if(!$scope.validateFields()) {
						return;
					}
					$scope.loading = true;
					$scope.member.birthdayString = $filter('date')($scope.member.birthday, GlobalVariableService.globalDateFormat);
					$scope.member.joiningDateString = $filter('date')($scope.member.joiningDate, GlobalVariableService.globalDateFormat);
					$scope.member.memberCode = GlobalMethodService.getUniqueCode(16);
					if($scope.member.id != null) {
						MemberService.updateMember($scope.member, function(member) {
							notificationService.success('Successfully Saved.');
							$scope.close(member);
						}, function(error) {
							notificationService.error('Error Occured');
							$scope.loading = false;
						})
					} else {
						MemberService.addMember($scope.member, function(member) {
							notificationService.success('Successfully Saved.');
							$scope.loading = false;
							$scope.close(member);
						}, function(error) {
							if(error.status == 400) {
								$scope.loading = false;
								notificationService.error(error.data);
							} else {
								$scope.loading = false;
								notificationService.error('Error Occured');
							}
						})
					}	
				}
        	},
			templateUrl: 'addMember.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
           		groups : $scope.groups,
				plans : $scope.plans
         	},
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      	})
      	.then(function(answer) {
        	$scope.getMembers();
      	}, function() {
        	
      	});
		$rootScope.dialogList.push(dialog);
	};
	
	$scope.addPayment = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
		  controller : function($scope, $mdDialog, $filter, GroupService, notificationService, GlobalMethodService, GlobalVariableService, MemberService, MembershipService, plans, member){
			$scope.member = member;
			$scope.plans = plans;
			$scope.loading = true;
			$scope.payment = {};
			$scope.isRefundMode = false;
			$scope.getMembershipPlan = function() {
				MembershipService.getByMemberId({id : $scope.member.id}, function(data) {
					$scope.payment = data;
					$scope.payment.amount = $scope.payment.amount;
					$scope.payment.prevDue = $scope.payment.dueAmount;
					if(parseFloat($scope.payment.dueAmount) < 0) {
						$scope.isRefundMode = true;
					}
					$scope.loading = false;
				})
			}

			$scope.makeRefund = function() {
				MembershipService.refundAmount({memberId : $scope.member.id}, function(response) {
					if(response != null) {
						notificationService.success("Successfully Updated.");
						$scope.close(response);
					} else {
						notificationService.error("Error Occurred.");
					}
				});
			}

			$scope.savePayment = function() {
				if($scope.payment.amountPaid == null || isNaN($scope.payment.amountPaid == null) || parseFloat($scope.payment.amountPaid) <= 0) {
					notificationService.error('Amount Paid should be greater than 0.');
					return;
				}
				var obj = {};
				obj.memberId = $scope.member.id;
				obj.amountPaid = parseFloat($scope.payment.amountPaid);
				obj.description = "Payemnt Received";
				MembershipService.addPayment(obj, function(data) {
					notificationService.success("Successfully Saved");
					$scope.close(data);
				})
			}
			$scope.getMembershipPlan();
			$scope.close = function(result) {
				if(result != null) {
					$mdDialog.hide(result);
				} else {
					$mdDialog.cancel();
				}
			};
			$scope.getMembershipPlanName = function(id) {
				var name = '';
				angular.forEach($scope.plans, function(v,k) {
					if(v.id == id) {
						name = v.name;
					}
				})
				return name;
			};
			$scope.$watch('payment.amountPaid', function(newValue, oldValue) {
				if(newValue != null && newValue != ''){
					var temp = parseInt($scope.payment.prevDue) - parseInt(newValue);
					if(temp < 0){
						$scope.payment.amountPaid = oldValue;
					} else {
						$scope.payment.dueAmount = temp;
					}
				} else {
					$scope.payment.dueAmount = $scope.payment.prevDue;
				}
			}, true)
		  },
		  templateUrl: 'addPayment.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  locals: {
			plans : $scope.plans,
			member : $scope.selectedmember
		   },
		  clickOutsideToClose:true,
		  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
		  $scope.getMembers();
		}, function() {
		  
		});
	  	$rootScope.dialogList.push(dialog);
  	}

	$scope.viewPaymentHistory = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
		  controller : function($scope, $mdDialog, $filter, GroupService, notificationService, GlobalMethodService, GlobalVariableService, MemberService, MembershipService, plans, member){
			$scope.member = member;
			$scope.plans = plans;
			$scope.loading = true;
			$scope.transactionHistory = [];
			$scope.getMembershipTransactionHistory = function() {
				MembershipService.getTransactionHistory({memberId : $scope.member.id}, function(data) {
					$scope.transactionHistory = data;
					$scope.loading = false;
				}, function(error) {
					$scope.loading = false;
				})
			}
			$scope.getMembershipTransactionHistory();
			$scope.close = function(result) {
				if(result != null) {
					$mdDialog.hide(result);
				} else {
					$mdDialog.cancel();
				}
			};

			$scope.getDateString = function(date) {
				if(date == null || date == '') {
					return '';
				}
				date = new Date(parseInt(date));
				return $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
			}

			$scope.getMembershipPlanName = function(id) {
				var name = '';
				angular.forEach($scope.plans, function(v,k) {
					if(v.id == id) {
						name = v.name;
					}
				})
				return name;
			};
		  },
		  templateUrl: 'paymentHistory.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  locals: {
			plans : $scope.plans,
			member : $scope.selectedmember
		   },
		  clickOutsideToClose:true,
		  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
			
		}, function() {
		  
		});
	  	$rootScope.dialogList.push(dialog);
  	}


  	$scope.viewDocuments = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
			controller : 'MemberDocumentCtrl',
			templateUrl: '/app/assets/angular/views/memberDocument.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
				member : $scope.selectedmember
			},
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
			
			}, function() {
		});
		$rootScope.dialogList.push(dialog);
	}

	$scope.messageMember = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
			controller : 'MessageDialogCtrl',
			templateUrl: '/app/assets/angular/views/messageDialog.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
				member : $scope.selectedmember
			},
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
			
			}, function() {
		});
		$rootScope.dialogList.push(dialog);
	}

	$scope.manageMemberShip = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
			controller : 'MembershipDialogCtrl',
			templateUrl: '/app/assets/angular/views/membershipDialog.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
				member : $scope.selectedmember
			},
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
				$scope.getMembers();
			}, function() {
				$scope.getMembers();
			}
		);
		$rootScope.dialogList.push(dialog);
	}


	$scope.viewIDCard = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
		  controller : function($scope, $mdDialog, $filter, notificationService, GlobalMethodService, GlobalVariableService, MemberService, member){
				$scope.member = member;
				$scope.close = function(result) {
					if(result != null) {
						$mdDialog.hide(result);
					} else {
						$mdDialog.cancel();
					}
				};
				setTimeout(function() {
					var element = $("#rowBox");
					var getCanvas;
					html2canvas(element, {
						width: element[0].offsetWidth * 1,
						height: element[0].offsetHeight * 1,
						background :'#FFFFFF',
						onrendered: function (canvas) {
						   getCanvas = canvas;
						   var imgageData = getCanvas.toDataURL("image/png");
						   var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
						   $("#btn-Convert-Html2Image").attr("download", $scope.member.firstName+"_"+$scope.member.lastName).attr("href", imgageData);
						}
				  	});
				}, 500)
				$(document).ready(function() {
					
				});
		    },
		    templateUrl: 'memberCard.html',
		    parent: angular.element(document.body),
		    targetEvent: ev,
		    locals: {
				member : $scope.selectedmember
		   	},
		   	clickOutsideToClose:true,
		   	fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
		}, function() {

		});
	  	$rootScope.dialogList.push(dialog);
	}
	$scope.sellProduct = function(ev) {
		if($scope.selectedmember.id == null) {
			return;
		}
		var dialog = $mdDialog.show({
		  controller : function($scope, $rootScope, $mdDialog, $filter, GroupService, notificationService, GlobalMethodService, GlobalVariableService, MemberService, ProductService, member){
			$scope.member = member;
			$scope.products = [];
			$scope.selectedProduct = {item : null};
			$scope.quantityToBuy = { value : null};

			$scope.getProducts = function() {
				$scope.loading = true;
				$scope.selectedProduct = {item : null};
				$scope.quantityToBuy = { value : null};
				ProductService.list({accountId : $rootScope.accountId}, function(data) {
					$scope.products = data;
					$scope.loading = false;
				}, function(error) {
					$scope.loading = false;
				})
			}
			$scope.getProducts();

			$scope.validateData = function() {
				if(GlobalMethodService.isEmptyString($scope.selectedProduct.item.id)) {
					notificationService.error("Please select a product to continue.");
					return false;
				} else if(GlobalMethodService.isEmptyString($scope.quantityToBuy.value)) {
					notificationService.error("Please enter a quantity to continue.");
					return false;
				} else if(parseFloat($scope.quantityToBuy.value) > $scope.selectedProduct.item.quantity_left) {
					notificationService.error("Please eneter a quantity less than available stock to continue.");
					return false;
				}
				return true; 
			}

			$scope.getDateString = function(date) {
				if(date == null || date == '') {
					return '';
				}
				date = new Date(parseInt(date));
				return $filter('date')(date, 'dd/MM/yyyy HH:mm:ss');
			}

			// ----------Apply Sort--------------------- //
			$scope.sortOrder = 'DESC';
			$scope.sortField = 'dateCreated';
			$scope.descendingOffImagePath = "/app/assets/angular/images/sort_descending_off.png";
			$scope.descendingOnImagePath = "/app/assets/angular/images/sort_descending_on.png";
			$scope.ascendingOnImagePath = "/app/assets/angular/images/sort_ascending_on.png";
			
		
			$scope.applySort = function(fieldName) {
				if($scope.sortOrder.indexOf('ASC') < 0) {
					$scope.sortOrder = 'ASC';
				} else {
					$scope.sortOrder = 'DESC';
				}
				$scope.sortField = fieldName;
				$scope.getProductsToMember();
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
			// ------------------------------------------//

			$scope.getProductsToMember = function() {
				var obj = {};
				obj.accountId = $rootScope.accountId;
				obj.memberId = $scope.member.id;
				obj.sortField = $scope.sortField;
				obj.sortOrder = $scope.sortOrder;
				$scope.listLoading = true;
				$scope.memberProducts = [];
				ProductService.getProductsToMember(obj, function(data) {
					$scope.listLoading = false;
					$scope.memberProducts = data;
				}, function(error) {
					$scope.listLoading = false;
				})
			}

			$scope.returnOrder = function(id) {
				var obj = {};
				obj.id = id;
				$scope.listLoading = true;
				ProductService.returnOrder(obj, function(data) {
					notificationService.success("Successfully Cancelled.");
					$scope.getProductsToMember();
				}, function(error) {
					notificationService.error(error.data);
					$scope.listLoading = false;
				})
			}

			$scope.sellProduct = function() {
				if(!$scope.validateData()) {
					return;
				}
				var obj = {};
				obj.productId = $scope.selectedProduct.item.id;
				obj.memberId = $scope.member.id;
				obj.memberType = 1;
				obj.quantity = $scope.quantityToBuy.value;
				$scope.loading = true;
				ProductService.assignProductToUser(obj, function(data) {
					notificationService.success("Successfully Created.");
					$scope.loading = false;
					$scope.getProducts();
				}, function(error) {
					notificationService.error(error.data);
					$scope.loading = false;
				})
			}

			$scope.close = function(result) {
				if(result != null) {
					$mdDialog.hide(result);
				} else {
					$mdDialog.cancel();
				}
			};
		  },
		  templateUrl: 'sellProduct.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  locals: {
			member : $scope.selectedmember
		   },
		  clickOutsideToClose:true,
		  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
		  $scope.getMembers();
		}, function() {
		  
		});
	  	$rootScope.dialogList.push(dialog);
  	}
}])



