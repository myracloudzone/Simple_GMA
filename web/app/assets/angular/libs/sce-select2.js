!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t(require("angular"));else if("function"==typeof define&&define.amd)define(["angular"],t);else{var n=t("object"==typeof exports?require("angular"):e.angular);for(var l in n)("object"==typeof exports?exports:e)[l]=n[l]}}(this,function(e){return function(e){function t(l){if(n[l])return n[l].exports;var i=n[l]={exports:{},id:l,loaded:!1};return e[l].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function l(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(1),r=l(i);n(3),n(2),n(4);var c=n(8),a=l(c),s=n(6),o=l(s),u=n(5),d=l(u),p=n(7),f=l(p);t["default"]=r["default"].module("sc.select",["ngSanitize","ui.select"]).factory("scSelectParser",a["default"]).directive("scSelect",o["default"]).directive("scOptions",d["default"]).directive("scSelectPaginator",f["default"]).run(["$templateCache",function(e){"ngInject";var t="select2/select-multiple.tpl.html",n=r["default"].element("<div>"+e.get(t)+"</div>");n.find("ul").next().prepend(r["default"].element("<sc-select-paginator></sc-select-paginator>")),n.find("input").attr("ng-disabled","$select.disabled || ($select.searchEnabled === false && $select.open)"),e.put(t,n.html())}]).run(["$templateCache",function(e){"ngInject";var t="select2/select.tpl.html",n=r["default"].element("<div>"+e.get(t)+"</div>");n.find("input").parent().append(r["default"].element("<sc-select-paginator></sc-select-paginator>")),e.put(t,n.html())}]).name},function(t,n){t.exports=e},function(e,t){},function(e,t){},function(e,t){},function(e,t){"use strict";function n(){"ngInject";return{restrict:"A",require:"scSelect",link:function(e,t,n,l){l.setOptionScope(e)}}}Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=n},function(e,t,n){"use strict";function l(e){return e&&e.__esModule?e:{"default":e}}function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(){"ngInject";function e(e,t,n,l,r,a,u,d){var p=this,f=s["default"].isDefined(p.loadingDelay)?p.loadingDelay:0;p.currentPage=1,p.canToggleAll=p.multiple&&!p.multipleLimit&&!p.pageLimit;var m=s["default"].element(o);p.multiple&&m.find("ui-select").attr("multiple","multiple"),n(m)(r),t.append(m),p.items=[];var g=void 0;p.searchItems=function(){if(p.uiSelectCtrl){var e=function(){g!==p.uiSelectCtrl.search&&(p.currentPage=1),g=p.uiSelectCtrl.search;var e=u(function(){p.loading=!0,p.items=[]},f);return{v:a.when(p.parsedOptions.source(p.optionScope,{page:p.currentPage,searchText:p.uiSelectCtrl.search})).then(function(e){p.items=e})["finally"](function(){p.loading=!1,u.cancel(e)})}}();if("object"===("undefined"==typeof e?"undefined":c(e)))return e.v}},p.changePage=function(e){p.currentPage=e,p.searchItems()},p.parsedOptions=d.parse(e.scOptions),p.setOptionScope=function(e){p.optionScope=e,p.changePage(p.currentPage)},p.setNgModelCtrl=function(e){p.ngModelCtrl=e,e.$render=function(){if(e.$viewValue){var t;t=p.multiple?e.$viewValue:p.items;var n=[];if(s["default"].isArray(t)&&(n=t.filter(function(t){var n;if(n=s["default"].isArray(t)?p.parsedOptions.modelMapper(i({},p.parsedOptions.itemName,t)):t,p.multiple){var l=!1;return"object"===c(e.$viewValue)?s["default"].forEach(e.$viewValue,function(e){"string"==typeof e&&e.indexOf(n)>-1&&(l=!0),e&&n&&e.id===n.id&&(l=!0)}):e.$viewValue.indexOf(n)>-1&&(l=!0),l}return"object"===("undefined"==typeof n?"undefined":c(n))?e.$viewValue===n.id||e.$viewValue===n.label||e.$viewValue.id===n.id:e.$viewValue===n})),"object"===c(e.$viewValue)){for(var l=0;l<e.$viewValue.length;l++)e.$viewValue[l].id||e.$viewValue.splice(l--,1);!n.length&&(e.$viewValue.length||Object.keys(e.$viewValue).length>1)&&(n=[e.$viewValue])}p.multiple?p.selected=n:p.selected=n[0]}},u(function(){p.ngModelCtrl.$render()})},p.modelChanged=function(){var e=void 0;e=p.multiple?p.selected.map(function(e){return p.parsedOptions.modelMapper(i({},p.parsedOptions.itemName,e))}):p.parsedOptions.modelMapper(i({},p.parsedOptions.itemName,p.selected)),p.ngModelCtrl.$setViewValue(e)},p.getMappedItem=function(e){return p.parsedOptions.viewMapper(i({},p.parsedOptions.itemName,e))},p.selectAll=function(){p.selected=p.items,p.modelChanged()},p.deselectAll=function(){p.selected=[],p.modelChanged()},r.$watch(function(){return p.ngModelCtrl.$modelValue},function(e){e||(p.selected=p.multiple?[]:"")},!0),s["default"].isDefined(p.pageLimit)||r.$watch(function(){return p.parsedOptions.source(p.optionScope)},function(e){e&&(p.items=e)}),s["default"].isUndefined(p.groupBy)&&s["default"].isDefined(e.groupBy)&&!function(){var t=l(e.groupBy);p.groupBy=function(e){return t(e)}}()}return e.$inject=["$attrs","$element","$compile","$parse","$scope","$q","$timeout","scSelectParser"],{restrict:"E",require:"ngModel",template:"<div></div>",controller:e,controllerAs:"vm",bindToController:!0,scope:{groupBy:"=",loadingDelay:"=",multiple:"=?",multipleLimit:"@",ngDisabled:"=",pageLimit:"=",placeholder:"@",refreshDelay:"=",searchEnabled:"=",toggleAllEnabled:"=",totalItems:"="},link:function(e,t,n,l){e.vm.setNgModelCtrl(l)}}}Object.defineProperty(t,"__esModule",{value:!0});var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t["default"]=r;var a=n(1),s=l(a),o='\n  <div ng-class="{ \'input-group select2-bootstrap-append\': vm.canToggleAll && vm.toggleAllEnabled !== false }">\n    <ui-select\n      class="form-control"\n      limit="{{ ::vm.multipleLimit }}"\n      ng-model="vm.selected"\n      ng-change="vm.modelChanged()"\n      ng-disabled="vm.ngDisabled"\n      search-enabled="vm.searchEnabled"\n      theme="select2">\n      <ui-select-match placeholder="{{ ::vm.placeholder }}">\n        {{ vm.getMappedItem($item || $select.selected) }}\n      </ui-select-match>\n      <ui-select-choices\n        repeat="item in vm.items | filter: $select.search"\n        refresh="vm.searchItems()"\n        refresh-delay="vm.refreshDelay || 200"\n        group-by="vm.groupBy">\n        <div ng-bind-html="vm.getMappedItem(item) | highlight: $select.search"></div>\n      </ui-select-choices>\n    </ui-select>\n    <span\n      class="input-group-btn"\n      ng-if="vm.canToggleAll && vm.toggleAllEnabled !== false">\n      <button\n        class="btn btn-default"\n        title="Adds all available options"\n        ng-click="vm.selectAll()"\n        type="button"\n        style="height: calc(100% + 14px)">\n        <i class="fa fa-check-square-o"></i>\n      </button>\n      <button\n        class="btn btn-default"\n        title="Removes all options"\n        ng-click="vm.deselectAll()"\n        type="button"\n        style="height: calc(100% + 14px)">\n        <i class="fa fa-square-o"></i>\n      </button>\n    </span>\n  </div>\n'},function(e,t,n){"use strict";function l(e){return e&&e.__esModule?e:{"default":e}}function i(){"ngInject";return{restrict:"E",require:["?^scSelect","^uiSelect"],template:'\n        <div\n          ng-show="vm.scSelectCtrl.loading"\n          style="padding: 10px"\n          class="text-center">\n          <i class="fa fa-spin fa-spinner"></i> <b>Loading...</b>\n        </div>\n        <div\n          ng-style="{padding: vm.scSelectCtrl.multiple ? \'10px\' : \'10px 0\'}"\n          ng-if="vm.scSelectCtrl && vm.scSelectCtrl.pageLimit"\n          ng-show="vm.scSelectCtrl.items.length > 0">\n          <div class="btn-group">\n            <button\n              type="button"\n              class="btn btn-default btn-xs"\n              ng-click="vm.scSelectCtrl.changePage(vm.scSelectCtrl.currentPage - 1)"\n              ng-disabled="vm.scSelectCtrl.currentPage <= 1">\n              <i class="fa fa-arrow-left"></i> Prev\n            </button>\n            <button\n              type="button"\n              class="btn btn-default btn-xs"\n              ng-click="vm.scSelectCtrl.changePage(vm.scSelectCtrl.currentPage + 1)"\n              ng-disabled="vm.scSelectCtrl.currentPage >= (vm.scSelectCtrl.totalItems / vm.scSelectCtrl.pageLimit)">\n              Next <i class="fa fa-arrow-right"></i>\n            </button>\n          </div>\n          <small class="pull-right">\n            {{ (vm.scSelectCtrl.currentPage - 1) * vm.scSelectCtrl.pageLimit + 1 }} -\n            {{ vm.scSelectCtrl.currentPage * vm.scSelectCtrl.pageLimit > vm.scSelectCtrl.totalItems ? vm.scSelectCtrl.totalItems : vm.scSelectCtrl.currentPage * vm.scSelectCtrl.pageLimit }} of\n            {{ vm.scSelectCtrl.totalItems }} results\n           </small>\n        </div>\n      ',scope:{},bindToController:!0,controller:c["default"].noop,controllerAs:"vm",link:function(e,t,n,l){l[0]&&(e.vm.scSelectCtrl=l[0],l[0].uiSelectCtrl=l[1])}}}Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=i;var r=n(1),c=l(r)},function(e,t){"use strict";function n(e){"ngInject";var t=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;return{parse:function(n){var l=n.match(t);if(!l)throw new Error('Expected options specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+n+'".');return{itemName:l[3],source:e(l[4]),viewMapper:e(l[2]||l[1]),modelMapper:e(l[1])}}}}n.$inject=["$parse"],Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=n}])});
//# sourceMappingURL=sc-select.min.js.map