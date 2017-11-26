var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var activityDAO = require('../dao/activityDAO.js');
var commonUtils = require("./CommonCtrl.js");
var smsSender = require('../lib/SmsSender.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function (app) {
    var controller = {};
    var errorMsg = '';
    var repeatMode = ['DO_NOT_REPEAT', 'EVERY_DAY', 'EVERY_WEEK', 'EVERY_MONTH', 'EVERY_YEAR'];

    controller.addActivity = function(req, res, next) {
        var obj = {};
        var now = moment().valueOf();
        if(!validateField(req)) {
            return logger.logResponse(400, errorMsg, errorMsg, res, req);
        }
        if(req.body.repeatMode != null) {
            if(req.body.repeatMode == 'DO_NOT_REPEAT') {
                obj.name = req.body.name;
                obj.description = req.body.description;
                obj.start = moment(req.body.start, "DD/MM/YYYY HH:mm:ss").valueOf();
                obj.end = moment(req.body.end, "DD/MM/YYYY HH:mm:ss").valueOf();
                obj.repeat_mode = req.body.repeatMode;
                obj.code = now;
                obj.color = req.body.color;
                obj.assign_field = req.body.assignField;
                obj.assigned_ids = JSON.stringify(req.body.assignIds);
                obj.accountId = req.headers.accountId;
                obj.active = true;
                obj.notify_by_sms = req.body.notifyBySMS;
                obj.date_created = now;
                obj.assigned_users = req.body.trainerIds == null ? JSON.stringify([]) : JSON.stringify(req.body.trainerIds);
                activityDAO.save(obj, req, res, function(data, error, req, res) {
                    var savedActivity = data;
                    if(error) {
                        return logger.logResponse(500, error, error, res, req); 
                    }
                    if(req.body.notifyBySMS != null && req.body.notifyBySMS == true) {
                        if(data.assign_field == 'member') {
                            if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                var ids = req.body.assignIds.join();
                                var query = "select * from member where id in ("+ids+") and active = 1 and accountId = "+req.headers.accountId;
                                commonUtils.makeDBRequest(query, function(error, data) {
                                    if(error) {
                                        return logger.logResponse(200, savedActivity, null, res, req); 
                                    }
                                    if(data == null) {
                                        return logger.logResponse(200, savedActivity, null, res, req); 
                                    }
                                    var phoneNumbers = [];
                                    async.mapSeries(data, function (member, cb) {
                                        phoneNumbers.push(member.mobile);
                                        cb();
                                    });
                                    if(phoneNumbers.length > 0) {
                                        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
                                            if(error) {
                                                return logger.logResponse(500, error, null, res, req); 
                                            }
                                            var smsCreditLeft = parseInt(data.sms_credit);
                                            if(smsCreditLeft >= phoneNumbers.length) {
                                                var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                                var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                                var msg = "A session for "+savedActivity.name+" has been scheduled on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                                async.mapSeries(phoneNumbers, function (number, cb) {
                                                    smsSender.sendMessage(number, msg, req, res, function(data, statusCode, req, res) {
                                                         
                                                    });
                                                    cb();
                                                })
                                                accountDAO.update(req.headers.accountId, {sms_credit : (smsCreditLeft - phoneNumbers.length)}, req, res, function(data, error, req, res) {
                                                    if(error) {
                                                        return logger.logResponse(500, "Error Occured.", error, res, req);
                                                    } else {
                                                        return logger.logResponse(200, savedActivity, null, res, req);
                                                    }
                                                }); 
                                            } else {
                                                return logger.logResponse(400, "You account dont have enough credits to send SMS. Please top up credits to send SMS.", "Dont have enough credits to send SMS. Please top up credits to send SMS.", res, req);
                                            }
                                        }); 
                                    } else {
                                        return logger.logResponse(200, savedActivity, null, res, req);
                                    }
                                })    
                            } else {
                                return logger.logResponse(200, savedActivity, null, res, req); 
                            }
                        } else if(data.assign_field == 'group') {
                            if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                var ids = req.body.assignIds.join();
                                var query = "select * from member m where m.group in ("+ids+") and m.active = 1 and m.accountId = "+req.headers.accountId;
                                commonUtils.makeDBRequest(query, function(error, data) {
                                    if(error) {
                                        return logger.logResponse(200, savedActivity, null, res, req); 
                                    }
                                    if(data == null) {
                                        return logger.logResponse(200, savedActivity, null, res, req); 
                                    }
                                    var phoneNumbers = [];
                                    async.mapSeries(data, function (member, cb) {
                                        phoneNumbers.push(member.mobile);
                                        cb();
                                    });
                                    if(phoneNumbers.length > 0) {
                                        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
                                            if(error) {
                                                return logger.logResponse(500, error, null, res, req); 
                                            }
                                            var smsCreditLeft = parseInt(data.sms_credit);
                                            if(smsCreditLeft >= phoneNumbers.length) {
                                                var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                                var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                                var msg = "A session for "+savedActivity.name+" has been scheduled on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                                async.mapSeries(phoneNumbers, function (number, cb) {
                                                    smsSender.sendMessage(number, msg, req, res, function(data, statusCode, req, res) {
                                                         
                                                    });
                                                    cb();
                                                })
                                                accountDAO.update(req.headers.accountId, {sms_credit : (smsCreditLeft - phoneNumbers.length)}, req, res, function(data, error, req, res) {
                                                    if(error) {
                                                        return logger.logResponse(500, "Error Occured.", error, res, req);
                                                    } else {
                                                        return logger.logResponse(200, savedActivity, null, res, req);
                                                    }
                                                }); 
                                            } else {
                                                return logger.logResponse(400, "You account dont have enough credits to send SMS. Please top up credits to send SMS.", "Dont have enough credits to send SMS. Please top up credits to send SMS.", res, req);
                                            }
                                        });
                                    } else {
                                        return logger.logResponse(200, savedActivity, null, res, req);
                                    }
                                })    
                            } else {
                                return logger.logResponse(200, savedActivity, null, res, req);  
                            }    
                        }
                    } else {
                        return logger.logResponse(200, savedActivity, null, res, req);
                    }     
                })
            } else if(repeatMode.indexOf(req.body.repeatMode) >= 0) {


            } else {
                return logger.logResponse(400, "Invalid Repeat Mode.", "Invalid Repeat Mode.", res, req);
            }
        } else {
            return logger.logResponse(400, "Repeat Mode is required.", "Repeat Mode is required.", res, req);
        }
    };
    controller.getActivities = function(req, res, next) {
        var obj = {};
        obj.accountId = req.headers.accountId;
        obj.active = true;
        activityDAO.findAll(obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            var results = [];
            async.mapSeries(data, function (activity, cb) {
                var obj = {};
                obj.id = activity.id;
                obj.accountId = activity.accountId;
                obj.active = activity.active;
                obj.name = activity.name;
                obj.description = activity.description;
                obj.start = moment(parseFloat(activity.start)).format("YYYY-MM-DDTHH:mm:ss");
                obj.end = moment(parseFloat(activity.end)).format("YYYY-MM-DDTHH:mm:ss");
                obj.repeatMode = activity.repeat_mode;
                obj.code = activity.code;
                obj.assignField = activity.assign_field;
                obj.assignIds = activity.assigned_ids;
                obj.notifyBySMS = activity.notify_by_sms;
                obj.trainerIds = activity.assigned_users;
                obj.color = activity.color;
                results.push(obj);
                cb();
            });
            return logger.logResponse(200, results, null, res, req);
        })
    };

    controller.deleteActivity = function(req, res, next) {
        var condition = {};
        condition.code = req.body.code;
        condition.accountId = req.headers.accountId;
        activityDAO.update(condition, {active : false}, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, "Successfully Deleted.", null, res, req);
        })
    };

    function validateField(req) {
        var valid = true; 
        if(req.body.name == null || req.body.name == '') {
            errorMsg = 'Name is required.';
            valid = false;
        }
        if(req.body.start == null || req.body.start == '') {
            errorMsg = 'Start Date/Time is required.';
            valid = false;
        }
        if(req.body.end == null || req.body.end == '') {
            errorMsg = 'End Time is required.';
            valid = false;
        }
        if(req.body.repeatMode == null || req.body.repeatMode == '') {
            errorMsg = 'Repet Mode is required.';
            valid = false;
        }
        if(repeatMode.indexOf(req.body.repeatMode) < 0) {
            errorMsg = 'Invalid Repeat Mode.';
            valid = false;
        }
        if(req.body.color == null || req.body.color == '') {
            errorMsg = 'Color is required.';
            valid = false;
        }
        return valid;
    }
	return controller;
}
