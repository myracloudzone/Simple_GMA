var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var httpsService = require('../lib/HTTPSService.js');
var systemVariable = require(config.outputFolder+'/variable.json');
module.exports = {
    sendMessage : function(sendTo, msg, req, res, cb) {
        var sendTo = sendTo;
        var msg = msg;
        var url = "http://nimbusit.co.in/api/swsendSingle.asp?username="+systemVariable.smsGatewayUsername+"&password="+ systemVariable.smsGatewayPassword +"&sender=" + systemVariable.smsGateWaySenderId + "&sendto=" +sendTo+ "&message="+msg;  
        httpsService.makeHTTPRequest(url, {}, function(data, statusCode) {
            cb(data, statusCode, req, res);
        })
    }
}   