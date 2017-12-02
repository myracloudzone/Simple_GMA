var ActivityCtrl = GMApp.controller('ActivityCtrl', ['$scope', '$rootScope','$location','AuthService', 'ipCookie', '$state', '$mdDialog', 'ActivityService', '$filter', 'notificationService', 'uiCalendarConfig', function($scope, $rootScope, $location, AuthService, ipCookie, $state, $mdDialog, ActivityService, $filter, notificationService, uiCalendarConfig) {
    $scope.popOverContextObject = null;
    $scope.activityIds = [];
    $scope.initVariables = {search : ""};
    $scope.isSearchOpen = false;
    $scope.closePopover = function() {
        $($scope.popOverContextObject).popover('hide');
        $scope.popOverContextObject = null;
    }

    $scope.getActivities = function() {
        $scope.closePopover();
        $scope.activitiesLoading = true;
        $scope.eventSources = [];
        $scope.activities = [];
        var index = 1;
        $scope.activityIds = [];
        ActivityService.list({accountId : $rootScope.accountId, search : $scope.initVariables.search}, function(data) {
            if(data != null) {
                angular.forEach(data, function(v,k) {
                    v.title = v.name;
                    v.start = $filter('date')(v.start, "yyyy-MM-ddTHH:mm:ss");
                    v.end = $filter('date')(v.end, "yyyy-MM-ddTHH:mm:ss");
                    v.className = index + '_Activity';
                    $scope.activityIds.push(v.id);
                    index++;
                })
                $scope.activities = data;
                if($scope.initVariables.search != null && $scope.initVariables.search != '') {
                    var msg = data.length == 0 ? 'No record found.' : data.length == 1 ? data.length + ' record found.' : data.length + ' records found.'
                    notificationService.info(msg);
                }
                $scope.eventSources.push(data);
            }
            $scope.activitiesLoading = false;
        })
    };

    $scope.getTimeFromString = function(date) {
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

    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.handleCalendarEvents(event, delta, 'DROP', revertFunc);
        // $scope.updateAgendaEvent(event, delta,'DROP');
    };

    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.handleCalendarEvents(event, delta, 'RESIZE', revertFunc);
    };

    $scope.handleCalendarEvents = function(event, delta, type, revertFunc) {
        var index = $scope.activityIds.indexOf(event.id);
        var object = angular.copy($scope.activities[index]);
        if(type == 'DROP') {
            var now = (new Date()).getTime();
            object.start = new Date(new Date(object.start).getTime() + delta);
            object.end = new Date(new Date(object.end).getTime() + delta);
            if(object.start < now) {
                notificationService.error('Activity can\'t be moved to past date.');
                revertFunc();
            } else {
                object.start = $filter('date')(object.start, "dd/MM/yyyy HH:mm:ss");
                object.end = $filter('date')(object.end, "dd/MM/yyyy HH:mm:ss");
                object.assignIds = JSON.parse(object.assignIds);
                object.trainerIds = JSON.parse(object.trainerIds);
                ActivityService.updateActivity(object, function(data) {
                    notificationService.success('Saved Successfully.');
                }, function(error) {
                    if(error.status == 400) {
                        notificationService.error("You don't have enough credits to send SMS. Please top up to get instant SMS.");
                    }
                });
            }
        } else {
            var endRange = new Date(object.start);
            endRange.setHours(23);
            endRange.setMinutes(59);
            object.start = new Date(new Date(object.start).getTime());
            object.end = new Date(new Date(object.end).getTime() + delta);
            if(object.end > endRange) {
                notificationService.error('Activity should end on the same day.');
                revertFunc();
            } else {
                object.start = $filter('date')(object.start, "dd/MM/yyyy HH:mm:ss");
                object.end = $filter('date')(object.end, "dd/MM/yyyy HH:mm:ss");
                object.assignIds = JSON.parse(object.assignIds);
                object.trainerIds = JSON.parse(object.trainerIds);
                ActivityService.updateActivity(object, function(data) {
                    notificationService.success('Saved Successfully.');
                }, function(error) {
                    if(error.status == 400) {
                        notificationService.error("You don't have enough credits to send SMS. Please top up to get instant SMS.");
                    }
                });
            }
        }
        
    }   
    
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
        $scope.closePopover();
        if($scope.selectedActivity.repeatMode != 'DO_NOT_REPEAT') {
            var dialog = $mdDialog.show({
                targetEvent: ev,
                template:
                  '<md-dialog>' +
                  '  <md-dialog-content><div class="col-sm-12"><p><h5>This is a recurring activity. Do you want to delete all the occurances of this activity?</h5></p></div></md-dialog-content>' +
      
                  '  <md-dialog-actions>' +
                  '    <md-button ng-click="close()" class="md-primary">' +
                  '      Cancel' +
                  '    </md-button>' +  
                  '    <md-button ng-click="close(singleDeleteAction)" class="md-primary">' +
                  '      No, Just delete this one!' +
                  '    </md-button>' +
                  '    <md-button ng-click="close(allDeleteAction)" class="md-primary">' +
                  '      Please do it!' +
                  '    </md-button>' +                
                  '  </md-dialog-actions>' +
                  '</md-dialog>',
                controller: function($scope, $mdDialog) {
                    $scope.singleDeleteAction = 'SINGLE_DELETE';
                    $scope.allDeleteAction = 'ALL_DELETE';
                    $scope.close = function(result) {
                        if (result != null) {
                            $mdDialog.hide(result);
                        } else {
                            $mdDialog.cancel();
                        }
                    };
                },
            })
            .then(function(answer) {
                if(answer == 'SINGLE_DELETE') {
                    ActivityService.deleteActivity({id : $scope.selectedActivity.id}, function(data) {
                        notificationService.success("Deleted Successfully.");
                        uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEvents', $scope.selectedActivity.id);
                        $scope.selectedActivity = null;
                    }, function(error) {
                        notificationService.error("Error Occurred.");
                    })
                } else if(answer == 'ALL_DELETE') {
                    ActivityService.deleteActivity({code : $scope.selectedActivity.code}, function(data) {
                        notificationService.success("Deleted Successfully.");
                        $scope.getActivities();
                        $scope.selectedActivity = null;
                    }, function(error) {
                        notificationService.error("Error Occurred.");
                    });
               }
            }, function() {
                
            });
            $rootScope.dialogList.push(dialog);
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
    $scope.editActivity = function(ev) {
        $scope.closePopover();
        $scope.add(ev, $scope.selectedActivity.id);
    }

    
    $scope.eventRender = function( event, element, view ) {
        element.context.innerHTML = '<div class="fc-content mt10"><div class="fc-title">'+'<span class="boldFont">'+event.title+'</span>'+'</div></div><div class="fc-bg"></div><div class="fc-resizer fc-end-resizer"></div>';
        $compile(element)($scope);
    };

    $scope.add = function(ev, id) {
        $scope.closePopover();
        var dialog = $mdDialog.show({
          controller : function($scope, $mdDialog, MemberService, $window, $mdSelect, GroupService, GlobalMethodService, notificationService, $filter, ActivityService) {
            $scope.calendar = { minDate : new Date(), maxDate : new Date('01/12/2099') };
            $scope.initVariables = {};
            $scope.searchTextForMember = "";  
            $scope.activity = {assignField : "member", repeatMode : "DO_NOT_REPEAT", color : '#3F51B5', selectedMember : [], selectedGroup : []};
            $scope.colorPicker = {};
            $scope.groups =[];
            $scope.loading = true;
            $scope.fetchData = function() {
                if(id == null) {
                    $scope.loading = false;
                } else {
                    ActivityService.getActivityById({id :id}, function(data) {
                        $scope.activity = data;
                        $scope.activityBackup = angular.copy(data); 
                        $scope.activity.startDate = new Date($scope.activity.start);
                        $scope.activity.start = new Date($scope.activity.start);
                        $scope.activity.end = new Date($scope.activity.end);
                        if($scope.activity.assignField == 'member') {
                            $scope.activity.selectedMember = JSON.parse($scope.activity.assignIds);
                        } else if($scope.activity.assignField == 'group') {
                            $scope.activity.selectedGroup = JSON.parse($scope.activity.assignIds);
                        }
                        $scope.loading = false;
                    }, function(error) {
                        $scope.loading = false;
                    });
                }
            }
            $scope.fetchData();
            
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
                if($scope.activity.id == null) {
                    var temp = angular.copy($scope.activity);
                    temp.start = $scope.getStartTime();
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
                } else {
                    var temp = angular.copy($scope.activity);
                    temp.start = $scope.getStartTime();
                    temp.end = $scope.getEndTime();
                    if(temp.start.getTime() >= temp.end.getTime()) {
                        notificationService.error("Start Time cannot be greater than End Time.");
                        return;
                    }
                    temp.start = $filter('date')(temp.start, "dd/MM/yyyy HH:mm:ss");
                    temp.end = $filter('date')(temp.end, "dd/MM/yyyy HH:mm:ss");
                    temp.assignIds = $scope.activity.assignField == 'member' ? $scope.activity.selectedMember : $scope.activity.selectedGroup;
                    temp.trainerIds = [];
                    ActivityService.updateActivity(temp, function(data) {
                        notificationService.success('Saved Successfully.');
                        $scope.close(data);
                    }, function(error) {
                        if(error.status == 400) {
                            notificationService.error("You don't have enough credits to send SMS. Please top up to get instant SMS.");
                            $scope.close({});
                        }
                        $scope.close({});
                    });
                }
            };

            $scope.getEndTime = function() {
                var tempDate = angular.copy($scope.activity.startDate);
                tempDate.setHours($scope.activity.end.getHours());
                tempDate.setMinutes($scope.activity.end.getMinutes());
                tempDate.setSeconds(0);
                return tempDate;
            }

            $scope.getStartTime = function() {
                var tempDate = angular.copy($scope.activity.startDate);
                tempDate.setSeconds(0);
                tempDate.setHours($scope.activity.start.getHours());
                tempDate.setMinutes($scope.activity.start.getMinutes());
                return tempDate;
            }

            $scope.validateData = function() {
                if(GlobalMethodService.isEmptyString($scope.activity.name)) {
                    notificationService.error('Name is required.');
                    return false;
                } else if(GlobalMethodService.isEmptyString($scope.activity.startDate)) {
                    notificationService.error('Start Date is required.');
                    return false;
                } else if(GlobalMethodService.isEmptyString($scope.activity.start)) {
                    notificationService.error('Start Time is required.');
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
