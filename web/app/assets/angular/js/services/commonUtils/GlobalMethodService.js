GMApp.factory('GlobalMethodService', function ($resource, $q, $rootScope, $filter) {

    var factoryMethods = {};
    var _getDateOrTimeByFormat = function (date, format) {
        return $filter('date')(date, format);
    }

	var _getUniqueCode = function (length) {
        var text = "";
        var combination = "0123456789";
        for (var i = 0; i < length; i++) {
            text += combination.charAt(Math.floor(Math.random() * combination.length));
        }
        return text;
    }

    _isNotEmptyString = function(str) {
		return !this.isEmptyString(str);
	},

	_isEmptyString = function(str) {
        if (str == null || angular.isUndefined(str) || str == 'undefined' || String(str).trim().length <= 0) {
            return true;
    		}
        return false;
    },

    _validateEmail = function (email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    factoryMethods.isNotEmptyString = _isNotEmptyString;
    factoryMethods.getDateOrTimeByFormat = _getDateOrTimeByFormat;
    factoryMethods.isEmptyString = _isEmptyString;
    factoryMethods.getUniqueCode = _getUniqueCode;
    factoryMethods.validateEmail = _validateEmail;
    return factoryMethods;
});
