GMApp.directive('logout', function($state) {
	return function(scope, element, attrs) {
		element.bind("click", function(event) {
			event.preventDefault();
			$state.go('logout');
		});
	};
});
GMApp.directive('positiveNumber', function() {
	return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return; 
          }

          ngModelCtrl.$parsers.push(function(val) {
            if (angular.isUndefined(val)) {
                var val = '';
            }
            var clean = val.replace(/[^0-9\.]/g, '');
            var decimalCheck = clean.split('.');

            if(!angular.isUndefined(decimalCheck[1])) {
                decimalCheck[1] = decimalCheck[1].slice(0,2);
                clean =decimalCheck[0] + '.' + decimalCheck[1];
            }

            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });

          element.bind('keypress', function(event) {
            if(event.keyCode === 32) {
              event.preventDefault();
            }
          });
        }
    };
})
GMApp.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind('keydown keypress', function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.ngEnter, {
						$event : event
					});
				});
				event.preventDefault();
			}
		});
	};
});
GMApp.directive('disableKey', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			event.preventDefault();
		});
		element.bind("click", function(event) {
			event.preventDefault();
		});
	};
});
GMApp.directive('stopEvent', function() {	
	return {
		restrict : 'A',
		link : function(scope, element, attr) {
			if (attr && attr.stopEvent)
				element.bind(attr.stopEvent, function(e) {
					e.stopPropagation();
				});
		}
	};
});	
GMApp.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});
GMApp.directive('map', function() {
    return {
        restrict: 'E',
		replace: true,
		scope: {
			lat : "@",
			long : "@"
        },
        template: '<div></div>',
        link: function(scope, element, attrs) {
            console.log(element);
            
            var myOptions = {
                zoom: 18,
                center: new google.maps.LatLng(scope.lat, scope.long),
                mapTypeId: google.maps.MapTypeId.HYBRID
            };
			var map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
			map.setTilt(100);
			
			scope.$watch('lat', function(newValue, oldValue){
				if(newValue != oldValue) {
					scope.lat = newValue;
					myOptions = {
						zoom: 18,
						center: new google.maps.LatLng(scope.lat, scope.long),
						mapTypeId: google.maps.MapTypeId.HYBRID
					};
					map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
					map.setTilt(100);
				}
			}, true);
			scope.$watch('long', function(newValue, oldValue){
				if(newValue != oldValue) {
					scope.long = newValue;
					myOptions = {
						zoom: 18,
						center: new google.maps.LatLng(scope.lat, scope.long),
						mapTypeId: google.maps.MapTypeId.HYBRID
					};
					map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
					map.setTilt(100);
				}
			}, true);
            google.maps.event.addListener(map, 'click', function(e) {
                scope.$apply(function() {
                    addMarker({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  }); 
                    
                    console.log(e);
                });
    
			}); // end click listener
			

            
            addMarker= function(pos){
               var myLatlng = new google.maps.LatLng(pos.lat,pos.lng);
               var marker = new google.maps.Marker({
                    position: myLatlng, 
                    map: map,
                    title:"Hello World!"
                });
            } //end addMarker
            
        }
    };
});

GMApp.directive('upload', function($http, $filter, notificationService) {
	var tpl = '<div class="uploadDiv col-sm-12" flex="100"><i class="fa fa-remove fa-md uploadDivClose" ng-if="showCloseButton"></i><p class="tCenter"><i class="fa fa-upload fa-lg fs40 textGreen"></i></p><p class="tCenter color-silver fs16 m0">Drop file here to Upload.</p><p class="tCenter color-silver fs16">or....</p><p class="tCenter color-silver fs16"> <button class="btn btn-primary btn-sm callFileChooser" ng-click="openFileChooser()" ng-disabled="fileUploading">Choose File</button><img class="p1 smallLoader" ng-if="fileUploading" src="/app/assets/angular/img/loading32.gif" /></p><input type="file" class="btn btn-info hidden fileChooser" size="40" accept="{{fileTypes}}" /><p class="fs16 color-charcoalGray" ng-if="uploadedFileName != null">Uploaded File Name : <span class="textGreen">{{uploadedFileName}}</span></p></div>';
	return {
        restrict: 'E',
        replace: false,
        scope: {
			callback: '&',
			url : "@",
			closebtnaction: '&',
			params : "@",
			fileTypes : "@",
			showclosebutton : "@",
        },
		require: '?ngModel',
		template : tpl,
        link: function(scope, element, attrs, ngModel) {
			scope.showCloseButton = scope.showclosebutton != null ? true : false;
			if(typeof attrs.callback =='undefined' || attrs.callback =='' || typeof attrs.url =='undefined' || attrs.url ==''){
				throw new Error("Callback and url must be defined as a attribute");
		   	}
        	element.on('dragover', function(e) {
   				e.preventDefault();
    			e.stopPropagation();
			});
			element.on('change',".fileChooser",function() {
				if (this.files.length > 0) {
				  uploadFileValidator(this.files);
				  return false;
        		}
   			});		
			element.on('dragenter', function(e) {
    			e.preventDefault();
    			e.stopPropagation();
			});
			element.on('click',".uploadDivClose", function() {
				scope.$apply(function() {
					scope.closebtnaction();
				})
			});

			scope.openFileChooser = function(e) {
				element.find(".fileChooser").click();
				e.preventDefault();
    			e.stopPropagation();
				return false;
			}

			element.on('drop', function(e) {
    			e.preventDefault();
    			e.stopPropagation();
   				if (e.originalEvent.dataTransfer){
        			if (e.originalEvent.dataTransfer.files.length > 0) {
        				return uploadFileValidator(e.originalEvent.dataTransfer.files)
        			}
    			}
    			return false;
			});

			function uploadFileValidator(file) {
				if(file != null) {
					if(file.length > 1) {
						notificationService.error('Please upload only one file at a time.');
						return false;
					}
					var fileTypesList = scope.fileTypes.split(",");
					var isFileWithValidExtension = false;
					for(var i=0; i<fileTypesList.length ;i++){
						if(file[0].name.endsWith(fileTypesList[i])){	
							isFileWithValidExtension = true;
							break; 
						}
					}
					if(!isFileWithValidExtension) {
						notificationService.error('Invalid file format.'+scope.fileTypes+' are allowed.');
						return false;
					}
					scope.fileUploading = true;
					upload(file);
	    		}
			}
			
			var upload = function(file) {
				var fd = new FormData();
				fd.append("file", file[0])
    			//get params
    			var parameter = eval('(' + scope.params + ')');
				for (var key in parameter) {
					fd.append(key , parameter[key])
				}
		   		$http.post(scope.url, fd, {
					encType : "multipart/form-data",
					transformRequest: angular.identity,
					'content-disposition' : "multipart/form-data",
					headers: {'Content-Type': undefined,
					'content-disposition' : "multipart/form-data"}
        		}).then(function(response) {
					scope.fileUploading = false;
					scope.closebtnaction();
					scope.callback({response : response});
				}, function() {
	        		scope.fileUploading = false;
	        	})
			};
        }
    };
})

GMApp.directive('positiveNumber', function() {
	return {
		require : '?ngModel',
		link : function(scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) {
				return;
			}
			ngModelCtrl.$parsers.push(function(val) {
				if (angular.isUndefined(val)) {
					var val = '';
				}
				var clean = val.replace(/[^-0-9]/g, '');
				var negativeCheck = clean.split('-');
				var decimalCheck = clean.split('.');
				if (!angular.isUndefined(negativeCheck[1])) {
					negativeCheck[1] = negativeCheck[1].slice(0,
							negativeCheck[1].length);
					clean = negativeCheck[0] + '-' + negativeCheck[1];
					if (negativeCheck[0].length > 0) {
						clean = negativeCheck[0];
					}
				}
				if (val !== clean) {
					ngModelCtrl.$setViewValue(clean);
					ngModelCtrl.$render();
				}
				return clean;
			});
			element.bind('keypress', function(event) {
				if (event.keyCode === 32) {
					event.preventDefault();
				}
			});
		}
	};
});
