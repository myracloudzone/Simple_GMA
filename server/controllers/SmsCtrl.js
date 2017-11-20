var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var smsSender = require('../lib/SmsSender.js');
var systemVariable = require(config.outputFolder+'/variable.json');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function(app) {
    var controller = {};
    controller.sendMessage = function(req, res, next) {
        var sendTo = req.body.mobileNumbers;
        var msg = req.body.msg;
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var smsCreditLeft = parseInt(data.sms_credit);
            if(smsCreditLeft >= sendTo.length) {
                smsSender.sendMessage(sendTo, msg, req, res, function(data, statusCode, req, res) {
                    if(statusCode == 200) {
                        accountDAO.update(req.headers.accountId, {sms_credit : (smsCreditLeft - sendTo.length)}, req, res, function(data, error, req, res) {
                            if(error) {
                                return logger.logResponse(500, "Error Occured.", error, res, req);
                            } else {
                                return logger.logResponse(200, "Sent Successfully.", null, res, req);
                            }
                        });
                    } else {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                });
            } else {
                return logger.logResponse(400, "You account dont have enough credits to send SMS. Please top up credits to send SMS.", "Dont have enough credits to send SMS. Please top up credits to send SMS.", res, req);
            }
        }); 
    }
    return controller;
};