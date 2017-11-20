var HomeCtrl = GMApp.controller('HomeCtrl', ['$scope', '$rootScope', '$stateParams', 'AccountService', 'MemberService', 'TransactionService', 'DashboardService', '$filter', 'PlanService', '$state','$location', function($scope, $rootScope, $stateParams, AccountService, MemberService, TransactionService, DashboardService, $filter, PlanService, $state, $location){
    console.log($stateParams)
    $scope.accountDetails = {};
    $scope.activeMemberCount = 0;
    $scope.financialData = {receivedAmount : 0, refundAmount : 0};
    $scope.showTransactionData = false;
    $scope.overDueMemberCount = 0;
    $rootScope.api = {};

    $scope.goToState = function(state) {
        $state.go(state, {id : $rootScope.accountId});
    }
    
    $scope.options = {
        chart: {
            type: 'pieChart',
            height: 300,
            x: function(d){return d.key;},
            y: function(d){return d.y;},
            showLabels: true,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            showLabels: false,
            valueFormat: function(d){
                return d;
            },
            noData : 'No Record Found',
            legend: {
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };

    $scope.getDateString = function(date) {
        if(date == null || date == '') {
            return '';
        }
        date = new Date(parseInt(date));
        return $filter('date')(date, 'dd/MM/yyyy');
    }

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
    
    $scope.getMembershipPlanName = function(id) {
		var name = '';
		angular.forEach($scope.plans, function(v,k) {
			if(v.id == id) {
				name = v.name;
			}
		})
		return name;
	}

    $scope.getAccountDetails = function() {
        $scope.noCreditData = false;
        $scope.creditLoading = true;
        AccountService.getById({}, function(data) {
            $scope.accountDetails = data;
            if($scope.accountDetails.sms_credit == 0 && $scope.accountDetails.email_credit == 0 && $scope.accountDetails.member_credit == 0
              && $scope.accountDetails.group_credit == 0 && $scope.accountDetails.plan_credit == 0 ) {
                $scope.noCreditData = true;
            }
            $scope.creditData = [
                {
                    key: "SMS Credits",
                    y: $scope.accountDetails.sms_credit
                },
                {
                    key: "Email Credits",
                    y: $scope.accountDetails.email_credit
                },
                {
                    key: "Member Credits",
                    y: $scope.accountDetails.member_credit
                },
                {
                    key: "Group Credits",
                    y: $scope.accountDetails.group_credit
                },
                {
                    key: "Plan Credits",
                    y: $scope.accountDetails.plan_credit
                }
            ];
            $scope.creditLoading = false;
        }, function(error) {
            $scope.noCreditData = true;
            $scope.creditLoading = false;
        })
    }

    $scope.getMemberCount = function() {
        MemberService.count({}, function(data) {
            $scope.activeMemberCount = data.count;
        })
    }

    $scope.getFinancialData = function() {
        $scope.financialData = {receivedAmount : 0, refundAmount : 0};
        TransactionService.getTotalAmount({}, function(data) {
            $scope.financialData = data;
        })
    }

    $scope.getFinancialData();

    $scope.getFinancialHistory = function() {
        $scope.showTransactionData = false;
        TransactionService.getTransactionHistoryForDashboard({}, function(data) {
            if(data != null) {
                var collectionData = [];
                var refundData = [];
                var balanceData = [];
                angular.forEach(data.collectionData, function(v,k) {
                    var data = {label : k, value : v};
                    collectionData.push(data);
                })
                angular.forEach(data.refundData, function(v,k) {
                    var data = {label : k, value : v == 0 ? 0 : v* (-1)};
                    refundData.push(data);
                })
                angular.forEach(data.balanceData, function(v,k) {
                    var data = {label : k, value : v};
                    balanceData.push(data);
                })
                $scope.incomeDataHistory = [
                    // {
                    //     key: "Income",
                    //     values: collectionData
                    // },
                    {
                        key: "Net Income",
                        values: balanceData
                    },
                    {
                        key: "Refund",
                        values: refundData
                    }
                    
                ]
            }
            $scope.showTransactionData = true;
         })
    }

    $scope.getFinancialHistory();


    $scope.getOverDueMember = function() {
        $scope.overDueMembers = [];
        var d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        searchDate = $filter('date')(d, "MM/dd/yyyy HH:mm:ss");
        var filter = {filterDate : searchDate};
        DashboardService.getMembershipDueMembers(filter, function(data) {
            if(data != null) {
                $scope.overDueMemberCount = data.length;
                $scope.overDueMembers = data;
            }
        })
    }

    $scope.sendGreetingMsg = function() {
        swal({  title:"",
            text: "Greeting Sent Successfully.",
            type : "success",    
            confirmButtonText: "Ok",
            closeOnConfirm: true,
            confirmButtonClass: "btn btn-danger",
            buttonsStyling: false,
            allowEscapeKey: false
        }, function(isConfirm) {
            
        });
    }

    $scope.memberAnalysisOption = {
        chart: {
            type: 'discreteBarChart',
            height: 300,
            margin : {
                top: 20,
                right: 20,
                bottom: 50,
                left: 55
            },
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showValues: true,
            valueFormat: function(d){
                return d;
            },
            duration: 500,
            xAxis: {
                axisLabel: 'X Axis'
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: -10
            },
            tooltip : {
                valueFormatter : function (d, i) {
                    return d;
                }
            },
        }
    };

    $scope.goToOverDueSection = function() {
        $('.dashboardDiv').animate({
            'scrollTop' : $("#overDueDiv").position().top
        });
        
    }

    $scope.getAnniversaryData = function() {
        $scope.anniversaryData = [];
        var d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        searchDate = $filter('date')(d, "MM/dd/yyyy HH:mm:ss");
        var filter = {filterDate : searchDate};
        DashboardService.getMembersWithBirthdayRange(filter, function(data) {
            if(data != null) {
                $scope.anniversaryData = data.birthdayData;
                $scope.anniversaryData.push.apply($scope.anniversaryData, data.anniversaryData);
            }
        })
    }

    $scope.getMemberCountByMonthData = function() {
        $scope.memberCountByMonthData = [];
        var d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        searchDate = $filter('date')(d, "MM/dd/yyyy HH:mm:ss");
        var filter = {filterDate : searchDate};
        DashboardService.getMembersCountByMonth(filter, function(data) {
            if(data != null && data.data != null) {
                var memberCountData = [];
                var index = 7;
                angular.forEach(data.data, function(v,k) {
                    var data = {label : k, value : v, color: $scope.colorSchemes[index]};
                    index--;
                    if(index == 0) {
                        index = 8;
                    }
                    memberCountData.push(data);
                })

                $scope.memberAnalysisData = [
                    {
                        key: "Member Registration By Month",
                        values: memberCountData
                    }
                ];
            }
        })
    }

    $scope.getMemberCountByMonthData();

    $scope.getAnniversaryData();

    $scope.getOverDueMember(); 

    $scope.getMemberCount();
    
    $scope.init = function(){
        $scope.getAccountDetails();
    }
    $scope.init();

    $scope.colorSchemes = ['#CDDC39', '#4CAF50', '#AB47BC', '#EC407A', '#7E57C2', '#00897B' ,'#8BC34A', '#004D40', '#80CBC4'];

    $scope.options2 = {
        chart: {
            type: 'multiBarChart',
            height: 300,
            margin : {
                top: 20,
                right: 20,
                bottom: 50,
                left: 55
            },
            x: function(d){return d.label},
            y: function(d){return d.value},
            showValues: true,
            valueFormat: function(d){
                return Number(d).toFixed(2);
            },
            tooltip : {
                valueFormatter : function (d, i) {
                    return Number(d).toFixed(2);
                }
            },
            duration: 500,
            xAxis: {
                axisLabel: 'X Axis'
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: -10
            },
            color: function (d, i) {
                if(d.key == 'Net Income') {
                    return $scope.colorSchemes[7];
                } else if(d.key == 'Balance'){
                    return $scope.colorSchemes[0];
                } else {
                    return $scope.colorSchemes[8];
                }
            }
        }
    };
}])
