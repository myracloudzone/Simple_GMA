var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var smsSender = require('../lib/SmsSender.js');
var systemVariable = require(config.outputFolder+'/variable.json');
var accountDAO = require('../dao/AccountDAO.js');
var smsHistoryDAO = require('../dao/SMSHistoryDAO.js');
var async = require('async');
var moment = require('moment');

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
    };
    controller.sendGroupMessage = function(req, res, next) {
        var smsContent = req.body.smsContent;
        if(smsContent == null || smsContent == '') {
            return logger.logResponse(400, "SMS Content is required.", "SMS Content is required.", res, req);
        }
        var memberData = req.body.memberData;
        if(memberData == null || memberData.length == 0) {
            return logger.logResponse(400, "Member Contact Information is required.", "Member Contact Information is required.", res, req);
        }
        var countOfSMS = memberData.length;
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var smsCreditLeft = parseInt(data.sms_credit);
            var smsHistory = [];
            if(smsCreditLeft >= countOfSMS) {
                async.mapSeries(memberData, function (member, cb) {
                    smsSender.sendMessage(member.mobile, smsContent, req, res, function(data, statusCode, req, res) {
                        if(statusCode == 200) {
                            var obj = {};
                            obj.senderUserId = req.headers.userId;
                            obj.messageReceipentType = req.body.receipentType; // 1 denotes Members // 2 App of User // 3 Annormous Users
                            obj.messageType = 1;  // Denoting Text Message
                            obj.memberId = member.memberId;
                            obj.subject = "";
                            obj.message = smsContent;
                            obj.status = 1; // Sent
                            obj.dateCreated = moment().valueOf();
                            obj.messageReceipentType = 1; //1 -> Member, 2 - >User
                            obj.mobile = member.mobile;
                            obj.accountId = req.headers.accountId;
                            smsHistory.push(obj);
                            smsHistoryDAO.saveSentMessageHistory(obj, req, res, function(data, error, req, res) {
                                if(error) {
                                    console.log(error);
                                }
                                cb();
                            });

                        } else {
                            return logger.logResponse(500, "Error Occured.", error, res, req);
                        }
                    });
                });
                accountDAO.update(req.headers.accountId, {sms_credit : (smsCreditLeft - countOfSMS)}, req, res, function(data, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    } else {
                        return logger.logResponse(200, "Sent Successfully.", null, res, req);
                    }
                });
            } else {
                return logger.logResponse(400, "You account dont have enough credits to send SMS. Please top up credits to send SMS.", "Dont have enough credits to send SMS. Please top up credits to send SMS.", res, req);
            }
        });
    };
    controller.getSentMesssageHistory = function(req, res, next) {
        var condition = {};
        condition.accountId = req.headers.accountId;
        if(req.query.sortOrder == null || req.query.sortOrder == ''){
            condition.sortField = 'dateCreated';
            condition.sortOrder = 'DESC';
        } else {
            condition.sortField = req.query.sortField;
            condition.sortOrder = req.query.sortOrder;
        }
        if(req.query.messageType == null || req.query.messageType == ''){
            condition.messageType = 1; // SMS
        } else {
            condition.messageType = req.query.messageType;
        }
        smsHistoryDAO.getSentMesssageHistory(condition, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            } else {
                return logger.logResponse(200, data, null, res, req);
            }
        })
    };
    return controller;
};