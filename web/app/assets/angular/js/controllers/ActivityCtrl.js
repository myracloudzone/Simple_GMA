var ActivityCtrl = GMApp.controller('ActivityCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state', '$mdDialog', 'ActivityService', '$filter', 'notificationService', 'uiCalendarConfig', function($scope, $rootScope, $location, AuthService, ipCookie, $state, $mdDialog, ActivityService, $filter, notificationService, uiCalendarConfig) {
    
    $scope.getActivities = function() {
        $scope.activitiesLoading = true;
        $scope.eventSources = [];
        var index = 1;
        ActivityService.list({accountId : $rootScope.accountId}, function(data) {
            if(data != null) {
                angular.forEach(data, function(v,k) {
                    v.title = v.name;
                    v.start = $filter('date')(v.start, "yyyy-MM-ddTHH:mm:ss");
                    v.end = $filter('date')(v.end, "yyyy-MM-ddTHH:mm:ss");
                    v.className = index + '_Activity';
                    index++;
                })
                $scope.eventSources.push(data);
            }
            $scope.activitiesLoading = false;
        })
    };

    $scope.getTimeFromString = function(date) {
        date = new Date(date);
        return $filter('date')(date, 'yyyy-MM-dd hh:mm a');
    }

    $scope.showPopoverOnClick = function(jsEvent, event) {
        setTimeout(function() {
            var className = event.className;
            if(Array.isArray(className)) {
                className = className[0];
            }
            $scope.popOverContextObject = $('.' + className).popover({
                placement: function(context, source) {
                    var position = $(source).offset();
                    if (position.left > 550) {
                        return "left";
                    }
                    if (position.left < 550) {
                        return "right";
                    }
                    if (position.top < 110) {
                        return "bottom";
                    }
                    return "top";
                },
                container: 'body',
                html: true,
                trigger: 'manual',
                content: function() {
                    return $('#popover-content').html();
                }
            });
            
        }, 10)

        setTimeout(function() {
            $('.edit-icon').on('click', function(e) {
                e.stopImmediatePropagation();
                $scope.editActivity();
            });
            $('.delete-icon').on('click', function(e) {
                e.stopImmediatePropagation();
                $scope.deleteActivity(e);
            });
        }, 500);
    };

    $scope.getActivities();

    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        // $scope.updateAgendaEvent(event, delta,'DROP');
    };
    
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
                if($scope.popOverContextObject != null && $scope.popOverContextObject.id == calEvent.id) {
                    $($scope.popOverContextObject).popover('hide');
                    $scope.popOverContextObject = null;
                    return;
                }
                if ($scope.popOverContextObject != null) {
                    $($scope.popOverContextObject).popover('hide');
                    $scope.popOverContextObject = null;
                    return;
                }
                $scope.calendarPopOverClass = { 'border-left' : '15px solid ' + calEvent.color};
                $scope.selectedActivity = calEvent;
                $scope.showPopoverOnClick(jsEvent, calEvent);
                setTimeout(function() {
                    $($scope.popOverContextObject).popover('show');
                }, 10);    
            
            },
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: function(event, element) { 
                 element.context.innerHTML = '<div class="fc-content mt10"><div class="fc-title">'+'<span class="boldFont">'+event.title+'</span>'+'</div></div><div class="fc-bg"></div><div class="fc-resizer fc-end-resizer"></div>';
            },
            viewRender: function (view, element) {
                $scope.defaultViewOfCalendar = view.name;
            }
        }
    };

    $scope.deleteActivity = function(ev) {
        $($scope.popOverContextObject).popover('hide');
        $scope.popOverContextObject = null;
        if($scope.selectedActivity.repeatMode != 'DO_NOT_REPEAT') {
            var confirm = $mdDialog.confirm()
            .title('This is a recurring activity. Do you want to delete all the occurances of this activity?')
            .textContent('')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('No, Just delete this one!');
              $mdDialog.show(confirm).then(function() {
                ActivityService.deleteActivity({code : $scope.selectedActivity.code}, function(data) {
                    notificationService.success("Deleted Successfully.");
                    $scope.getActivities();
                    $scope.selectedActivity = null;
                }, function(error) {
                    notificationService.error("Error Occurred.");
                })
              }, function() {
                    ActivityService.deleteActivity({id : $scope.selectedActivity.id}, function(data) {
                        notificationService.success("Deleted Successfully.");
                        uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEvents', $scope.selectedActivity.id);
                        $scope.selectedActivity = null;
                    }, function(error) {
                        notificationService.error("Error Occurred.");
                    })
              });
        } else {
            var confirm = $mdDialog.confirm()
            .title('Would you like to delete this activity?')
            .textContent('')
            .ariaLabel('Delete')
            .targetEvent(ev)
            .ok('Please do it!')
            .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                ActivityService.deleteActivity({id : $scope.selectedActivity.id}, function(data) {
                    notificationService.success("Deleted Successfully.");
                    uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEvents', $scope.selectedActivity.id);
                    $scope.selectedActivity = null;
                }, function(error) {
                    notificationService.error("Error Occurred.");
                })
            }, function() {
        
            });
        }
    }
    $scope.editActivity = function() {
        alert("Under Construction.");
    }

    $scope.eventRender = function( event, element, view ) {
        element.context.innerHTML = '<div class="fc-content mt10"><div class="fc-title">'+'<span class="boldFont">'+event.title+'</span>'+'</div></div><div class="fc-bg"></div><div class="fc-resizer fc-end-resizer"></div>';
        $compile(element)($scope);
    };

    $scope.add = function(ev, id) {
        var dialog = $mdDialog.show({
          controller : function($scope, $mdDialog, MemberService, $window, $mdSelect, GroupService, GlobalMethodService, notificationService, $filter, ActivityService) {
            $scope.calendar = { minDate : new Date(), maxDate : new Date('01/12/2099') };
            $scope.initVariables = {};
            $scope.searchTextForMember = "";  
            $scope.activity = {assignField : "member", repeatMode : "DO_NOT_REPEAT", color : '#3F51B5', selectedMember : [], selectedGroup : []};
            $scope.colorPicker = {};
            $scope.groups =[];
            $scope.colorPicker.options = {
                label: "Color",
                default: "#f00",
                genericPalette: false,
                history: true
            };
            $scope.close = function(result) {
                if (result != null) {
                    $mdDialog.hide(result);
                } else {
                    $mdDialog.cancel();
                }
            };
            $scope.saveActivity = function() {
                if(!$scope.validateData()) {
                    return;
                }
                var temp = angular.copy($scope.activity);
                temp.start.setSeconds(0);
                temp.end = $scope.getEndTime();
                if(temp.start.getTime() >= temp.end.getTime()) {
                    notificationService.error("Start Time cannot be greater than End Time.");
                    return;
                }
                temp.start = $filter('date')(temp.start, "dd/MM/yyyy HH:mm:ss");
                temp.end = $filter('date')(temp.end, "dd/MM/yyyy HH:mm:ss");
                temp.endDate = $filter('date')(temp.endDate, "dd/MM/yyyy HH:mm:ss");
                temp.assignIds = $scope.activity.assignField == 'member' ? $scope.activity.selectedMember : $scope.activity.selectedGroup;
                temp.trainerIds = [];
                ActivityService.addActivity(temp, function(data) {
                    notificationService.success('Saved Successfully.');
                    $scope.close(data);
                }, function(error) {
                    if(error.status == 400) {
                        notificationService.error("You don't have enough credits to send SMS. Please top up to get instant SMS.");
                        $scope.close({});
                    }
                    $scope.close({});
                });
            };

            $scope.getEndTime = function() {
                var tempDate = angular.copy($scope.activity.start);
                tempDate.setHours($scope.activity.end.getHours());
                tempDate.setMinutes($scope.activity.end.getMinutes());
                tempDate.setSeconds(0);
                return tempDate;
            }

            $scope.validateData = function() {
                if(GlobalMethodService.isEmptyString($scope.activity.name)) {
                    notificationService.error('Name is required.');
                    return false;
                } else if(GlobalMethodService.isEmptyString($scope.activity.start)) {
                    notificationService.error('Start Date is required.');
                    return false;
                } else if(GlobalMethodService.isEmptyString($scope.activity.end)) {
                    notificationService.error('End Time is required.');
                    return false;
                }
                return true;
            };

            $scope.getMembers = function() {
                MemberService.list({page : 1, pageSize : 100000, search : $scope.initVariables.search, active : true }, function(data) {
                    if(data != null && data.data != null) {
                        $scope.members = data.data;
                    }
                }, function(err) {
              
                })
            };

            $scope.getGroups = function() {
                GroupService.list({accountId : $rootScope.accountId}, function (data) {
                    if(data != null) {
                        $scope.groups = data;
                    }
                });
            }
            $scope.getGroups();
            $scope.getMembers();
          },
          templateUrl: 'addActivity.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
            $scope.getActivities();
        }, function() {
            
        });
        $rootScope.dialogList.push(dialog);
    }
}])
