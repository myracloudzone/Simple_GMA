var ActivityCtrl = GMApp.controller('ActivityCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state', '$mdDialog', function($scope, $rootScope, $location, AuthService, ipCookie, $state, $mdDialog) {
    $scope.eventSources = [[{
        title: 'All Day Event',
        start: '2017-11-01'
    },
    {
        title: 'Long Event',
        start: '2017-11-07',
        end: '2017-11-10'
    },
    {
        id: 999,
        title: 'Repeating Event',
        start: '2017-11-09T16:00:00'
    },
    {
        id: 999,
        title: 'Repeating Event',
        start: '2017-11-16T16:00:00'
    },
    {
        title: 'Meeting',
        start: '2014-06-12T10:30:00',
        end: '2017-11-12T12:30:00'
    },
    {
        title: 'Lunch',
        start: '2017-11-12T12:00:00'
    },
    {
        title: 'Birthday Party',
        start: '2017-11-13T07:00:00'
    },
    {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: '2017-11-28'
    }]];
    $scope.uiConfig = {
        calendar:{
          height: 550,
          editable: true,
          header:{
            left: 'month agendaWeek agendaDay',
            center: 'title',
            right: 'today prev,next'
          },
          eventClick: function(calEvent, jsEvent, view) {
                    alert('Event: ' + calEvent.title);
                    alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
                    alert('View: ' + view.name);
            
                    // change the border color just for fun
                    $(this).css('border-color', 'red');
            
                },
                select: function( start, end, jsEvent, view) {
                    alert();
                },
          eventDrop: $scope.alertOnDrop,
          eventResize: $scope.alertOnResize
        }
    };

    $scope.add = function(ev, id) {
        $mdDialog.show({
          controller : function($scope, $mdDialog, MemberService, $window, $mdSelect) {
            $scope.calendar = { minDate : new Date(), maxDate : new Date('01/12/2099') };
            $scope.initVariables = {};
            $scope.searchTextForMember = "";  
            $scope.activity = {assignField : "member"};
            $scope.close = function() {
              $mdDialog.cancel();
            };
            $scope.showDateTrigger = function() {
                $scope.showDatePicker = !$scope.showDatePicker;
            }
            $scope.clearSearchTerm = function() {
                $scope.searchTextForMember = "";
            };
            $scope.closeSelect = function() {
                $mdSelect.hide();
            }
            $scope.transformMemberChip = function(chip) {
                if (angular.isObject(chip)) {
                  return chip;
                }
                return { firstName: chip, lastName: '' };
            }
            $scope.getMembers = function() {
                MemberService.list({page : 1, pageSize : 100000, search : $scope.initVariables.search, active : true }, function(data) {
                    if(data != null && data.data != null) {
                        $scope.members = data.data;
                    }
                }, function(err) {
              
                })
            };
            $scope.querySearchForMember = function(query) {
                var results = [];
                angular.forEach($scope.members, function(v,k) {
                    if(v.firstName.toLowerCase().indexOf(query) >= 0 || v.lastName.toLowerCase().indexOf(query) >= 0) {
                        results.push(v);
                    }
                })
                console.log("Result Count is "+results.length)
                return results;
            };
            $scope.getMembers();
          },
          templateUrl: 'addActivity.html',
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
}])
