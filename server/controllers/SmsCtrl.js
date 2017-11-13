var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var httpsService = require('../lib/HTTPSService.js');
var systemVariable = require(config.outputFolder+'/variable.json');

module.exports = function(app) {
    var controller = {};
    controller.sendMessage = function(req, res, next) {
        var sendTo = req.body.mobileNumbers;
        var msg = req.body.msg;
        var url = "http://nimbusit.co.in/api/swsendSingle.asp?username="+systemVariable.smsGatewayUsername+"&password="+ systemVariable.smsGatewayPassword +"&sender=" + systemVariable.smsGateWaySenderId + "&sendto=" +sendTo+ "&message="+msg;  
        console.log(url);
        httpsService.makeHTTPRequest(url, {}, function(data, statusCode) {
            res.send(data);
        })
    }
    return controller;
};