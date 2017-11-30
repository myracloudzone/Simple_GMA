
var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var activityDAO = require('../dao/ActivityDAO.js');
var commonUtils = require("./CommonCtrl.js");
var smsSender = require('../lib/SmsSender.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function (app) {
    var controller = {};
    var errorMsg = '';
    var repeatMode = ['DO_NOT_REPEAT', 'EVERY_DAY', 'EVERY_WEEK', 'EVERY_MONTH', 'EVERY_YEAR'];

    function getTimeBasis(obj) {
        if(obj.repeat_mode == 'EVERY_DAY') {
            return 'daily basis';
        } else if(obj.repeat_mode == 'EVERY_WEEK') {
            return 'weekly basis';
        } else if(obj.repeat_mode == 'EVERY_MONTHLY') {
            return 'monthly basis';
        } else if(obj.repeat_mode == 'EVERY_YEAR') {
            return 'yearly basis';
        }
    }


    function sendMeetingNotification (phoneNumbers, msg, req, res, callback) {
        if(phoneNumbers.length > 0) {
            accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
                if(error) {
                    callback(null, error, 500);
                }
                var smsCreditLeft = parseInt(data.sms_credit);
                if(smsCreditLeft >= phoneNumbers.length) {
                    async.mapSeries(phoneNumbers, function (number, cb) {
                        smsSender.sendMessage(number, msg, req, res, function(data, statusCode, req, res) {
                             
                        });
                        cb();
                    })
                    accountDAO.update(req.headers.accountId, {sms_credit : (smsCreditLeft - phoneNumbers.length)}, req, res, function(data, error, req, res) {
                        if(error) {
                            callback(null, error, 500);
                        } else {
                            callback("Sent Successfully", null, 200);
                        }
                    }); 
                } else {
                    callback("You account dont have enough credits to send SMS. Please top up credits to send SMS.", "You account dont have enough credits to send SMS. Please top up credits to send SMS.", 400);
                }
            }); 
        } else {
            callback("Phone Numbers are empty.", null, 200);
        }
    }

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
                            async.parallel({
                                notifyMembers: function(callbackNotifyMember) {
                                    if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                        var ids = req.body.assignIds.join();
                                        var query = "select * from member where id in ("+ids+") and active = 1 and accountId = "+req.headers.accountId;
                                        commonUtils.makeDBRequest(query, function(error, data) {
                                            if(error) {
                                                callbackNotifyMember(null, savedActivity);
                                            }
                                            if(data == null) {
                                                callbackNotifyMember(null, savedActivity);
                                            }
                                            var phoneNumbers = [];
                                            async.mapSeries(data, function (member, cb) {
                                                phoneNumbers.push(member.mobile);
                                                cb();
                                            });
                                            var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                            var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                            var msg = "A session for "+savedActivity.name+" has been scheduled on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                            sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                                if(error) {
                                                    callbackNotifyMember({errorCode : statusCode, error : error}, null);
                                                }
                                                callbackNotifyMember(null, savedActivity);
                                            })
                                        })    
                                    } else {
                                        callbackNotifyMember(null, savedActivity);
                                    } 
                                },
                                notifyUsers: function(callbackNotifyUser) {
                                    if(req.body.trainerIds != null && req.body.trainerIds.length > 0) {
                                        var ids = req.body.assignIds.join();
                                        var query = "select * from users u where u.id in ("+ids+") and u.active = 1 and u.accountId = "+req.headers.accountId;
                                        commonUtils.makeDBRequest(query, function(error, data) {
                                            if(error) {
                                                callbackNotifyUser(null, savedActivity);
                                            }
                                            if(data == null) {
                                                callbackNotifyUser(null, savedActivity);
                                            }
                                            var phoneNumbers = [];
                                            async.mapSeries(data, function (member, cb) {
                                                phoneNumbers.push(member.mobile);
                                                cb();
                                            });
                                            var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                            var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                            var msg = "A session for "+savedActivity.name+" has been scheduled for you as a mentor on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                            sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                                if(error) {
                                                    callbackNotifyUser({errorCode : statusCode, error : error}, null);
                                                }
                                                callbackNotifyUser(null, savedActivity);
                                            })
                                        })    
                                    } else {
                                        callbackNotifyUser(null, savedActivity);
                                    } 
                                }
                            }, function(err, results) {
                                if(err) {
                                    return logger.logResponse(err.errorCode, err.error, err.error, res, req);
                                }
                                return logger.logResponse(200, savedActivity, null, res, req); 
                            }); 
                        } else if(data.assign_field == 'group') {
                            async.parallel({
                                notifyMembers: function(callbackNotifyMember) {
                                    if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                        var ids = req.body.assignIds.join();
                                        var query = "select * from member m where m.group in ("+ids+") and m.active = 1 and m.accountId = "+req.headers.accountId;
                                        commonUtils.makeDBRequest(query, function(error, data) {
                                            if(error) {
                                                callbackNotifyMember(null, savedActivity);
                                            }
                                            if(data == null) {
                                                callbackNotifyMember(null, savedActivity);
                                            }
                                            var phoneNumbers = [];
                                            async.mapSeries(data, function (member, cb) {
                                                phoneNumbers.push(member.mobile);
                                                cb();
                                            });
                                            var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                            var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                            var msg = "A session for "+savedActivity.name+" has been scheduled on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                            sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                                if(error) {
                                                    callbackNotifyMember({errorCode : statusCode, error : error}, null);
                                                }
                                                callbackNotifyMember(null, savedActivity);
                                            })
                                        })    
                                    } else {
                                        callbackNotifyMember(null, savedActivity);
                                    } 
                                },
                                notifyUsers: function(callbackNotifyUser) {
                                    if(req.body.trainerIds != null && req.body.trainerIds.length > 0) {
                                        var ids = req.body.assignIds.join();
                                        var query = "select * from users u where u.id in ("+ids+") and u.active = 1 and u.accountId = "+req.headers.accountId;
                                        commonUtils.makeDBRequest(query, function(error, data) {
                                            if(error) {
                                                callbackNotifyUser(null, savedActivity);
                                            }
                                            if(data == null) {
                                                callbackNotifyUser(null, savedActivity);
                                            }
                                            var phoneNumbers = [];
                                            async.mapSeries(data, function (member, cb) {
                                                phoneNumbers.push(member.mobile);
                                                cb();
                                            });
                                            var startDate = moment(parseFloat(savedActivity.start)).format("YYYY-MM-DD");
                                            var startTime = moment(parseFloat(savedActivity.start)).format("hh:mm a");
                                            var msg = "A session for "+savedActivity.name+" has been scheduled for you as a mentor on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                            sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                                if(error) {
                                                    callbackNotifyUser({errorCode : statusCode, error : error}, null);
                                                }
                                                callbackNotifyUser(null, savedActivity);
                                            })
                                        })    
                                    } else {
                                        callbackNotifyUser(null, savedActivity);
                                    } 
                                }
                            }, function(err, results) {
                                if(err) {
                                    return logger.logResponse(err.errorCode, err.error, err.error, res, req);
                                }
                                return logger.logResponse(200, savedActivity, null, res, req); 
                            });       
                        }
                    } else {
                        return logger.logResponse(200, savedActivity, null, res, req);
                    }     
                })
            } else if(repeatMode.indexOf(req.body.repeatMode) >= 0) {
                handleActivityWithRepeatMode(req, res);
            } else {
                return logger.logResponse(400, "Invalid Repeat Mode.", "Invalid Repeat Mode.", res, req);
            }
        } else {
            return logger.logResponse(400, "Repeat Mode is required.", "Repeat Mode is required.", res, req);
        }
    };

    function handleActivityWithRepeatMode(req, res) {
        var now = moment().valueOf();
        var start = moment(req.body.start, "DD/MM/YYYY HH:mm:ss").valueOf();
        var end = moment(req.body.end, "DD/MM/YYYY HH:mm:ss").valueOf();
        var endRange = moment(req.body.endDate, "DD/MM/YYYY HH:mm:ss");
        var endDateForMsg = end;
        endRange.set({h: 23, m: 59});
        endRange = endRange.valueOf();
        var obj = {};
        obj.name = req.body.name;
        obj.description = req.body.description;
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
        getStartAndEndDates(start, end, endRange, req.body.repeatMode, function(data) {
            async.mapSeries(data.startTimes, function(startTime, cb) {
                var index = data.startTimes.indexOf(startTime);
                var tempStartTime = startTime;
                var tempEndTime = data.endTimes[index];
                obj.start = tempStartTime;
                obj.end = tempEndTime;
                activityDAO.save(obj, req, res, function(data, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    cb();
                });
            })
            endDateForMsg = moment(data.endTimes[data.endTimes.length - 1]).format("DD/MM/YYYY");
            if(req.body.notifyBySMS != null && req.body.notifyBySMS == true) {
                if(obj.assign_field == 'member') {
                    if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                        async.parallel({
                            notifyMembers: function(callbackNotifyMember) {
                                if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                    var ids = req.body.assignIds.join();
                                    var query = "select * from member where id in ("+ids+") and active = 1 and accountId = "+req.headers.accountId;
                                    commonUtils.makeDBRequest(query, function(error, data) {
                                        if(error) {
                                            callbackNotifyMember(null, "Success");
                                        }
                                        if(data == null) {
                                            callbackNotifyMember(null, "Success");
                                        }
                                        var phoneNumbers = [];
                                        async.mapSeries(data, function (member, cb) {
                                            phoneNumbers.push(member.mobile);
                                            cb();
                                        });
                                        var startDate = moment(start).format("YYYY-MM-DD");
                                        var startTime = moment(start).format("hh:mm a");
                                        var msg = "A session for "+obj.name+" has been scheduled on "+getTimeBasis(obj)+" from "+startDate+" at "+startTime+" till "+endDateForMsg+".\n\nThank You!!!";
                                        sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                            if(error) {
                                                callbackNotifyMember({errorCode : statusCode, error : error}, null);
                                            }
                                            callbackNotifyMember(null, "Success");
                                        })
                                    })    
                                } else {
                                    callbackNotifyMember(null, "Success");
                                } 
                            },
                            notifyUsers: function(callbackNotifyUser) {
                                if(req.body.trainerIds != null && req.body.trainerIds.length > 0) {
                                    var ids = req.body.assignIds.join();
                                    var query = "select * from users u where u.id in ("+ids+") and u.active = 1 and u.accountId = "+req.headers.accountId;
                                    commonUtils.makeDBRequest(query, function(error, data) {
                                        if(error) {
                                            callbackNotifyUser(null, "Success");
                                        }
                                        if(data == null) {
                                            callbackNotifyUser(null, "Success");
                                        }
                                        var phoneNumbers = [];
                                        async.mapSeries(data, function (member, cb) {
                                            phoneNumbers.push(member.mobile);
                                            cb();
                                        });
                                        var startDate = moment(start).format("YYYY-MM-DD");
                                        var startTime = moment(start).format("hh:mm a");
                                        var msg = "A session for "+obj.name+" has been scheduled for you as a mentor on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                        sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                            if(error) {
                                                callbackNotifyUser({errorCode : statusCode, error : error}, null);
                                            }
                                            callbackNotifyUser(null, "Success");
                                        })
                                    })    
                                } else {
                                    callbackNotifyUser(null, "Success");
                                } 
                            }
                        }, function(err, results) {
                            if(err) {
                                return logger.logResponse(err.errorCode, err.error, err.error, res, req);
                            }
                            return logger.logResponse(200, "Saved Successfully.", null, res, req); 
                        });  
                    } else {
                        return logger.logResponse(200, "Saved Successfully.", null, res, req); 
                    }
                } else if(obj.assign_field == 'group') {
                    async.parallel({
                        notifyMembers: function(callbackNotifyMember) {
                            if(req.body.assignIds != null && req.body.assignIds.length > 0) {
                                var ids = req.body.assignIds.join();
                                var query = "select * from member m where m.group in ("+ids+") and m.active = 1 and m.accountId = "+req.headers.accountId;
                                commonUtils.makeDBRequest(query, function(error, data) {
                                    if(error) {
                                        callbackNotifyMember(null, "Success");
                                    }
                                    if(data == null) {
                                        callbackNotifyMember(null, "Success");
                                    }
                                    var phoneNumbers = [];
                                    async.mapSeries(data, function (member, cb) {
                                        phoneNumbers.push(member.mobile);
                                        cb();
                                    });
                                    var startDate = moment(start).format("YYYY-MM-DD");
                                    var startTime = moment(start).format("hh:mm a");
                                    var msg = "A session for "+obj.name+" has been scheduled on "+getTimeBasis(obj)+" from "+startDate+" at "+startTime+" till "+endDateForMsg+".\n\nThank You!!!";
                                    sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                        if(error) {
                                            callbackNotifyMember({errorCode : statusCode, error : error}, null);
                                        }
                                        callbackNotifyMember(null, "Success");
                                    })
                                })    
                            } else {
                                callbackNotifyMember(null, "Success");
                            } 
                        },
                        notifyUsers: function(callbackNotifyUser) {
                            if(req.body.trainerIds != null && req.body.trainerIds.length > 0) {
                                var ids = req.body.assignIds.join();
                                var query = "select * from users u where u.id in ("+ids+") and u.active = 1 and u.accountId = "+req.headers.accountId;
                                commonUtils.makeDBRequest(query, function(error, data) {
                                    if(error) {
                                        callbackNotifyUser(null, "Success");
                                    }
                                    if(data == null) {
                                        callbackNotifyUser(null, "Success");
                                    }
                                    var phoneNumbers = [];
                                    async.mapSeries(data, function (member, cb) {
                                        phoneNumbers.push(member.mobile);
                                        cb();
                                    });
                                    var startDate = moment(start).format("YYYY-MM-DD");
                                    var startTime = moment(start).format("hh:mm a");
                                    var msg = "A session for "+obj.name+" has been scheduled for you as a mentor on "+startDate+" at "+startTime+".\n\nThank You!!!";
                                    sendMeetingNotification(phoneNumbers,msg, req, res, function(msg, error, statusCode) {
                                        if(error) {
                                            callbackNotifyUser({errorCode : statusCode, error : error}, null);
                                        }
                                        callbackNotifyUser(null,  "Success");
                                    })
                                })    
                            } else {
                                callbackNotifyUser(null,  "Success");
                            } 
                        }
                    }, function(err, results) {
                        if(err) {
                            return logger.logResponse(err.errorCode, err.error, err.error, res, req);
                        }
                        return logger.logResponse(200,  "Success", null, res, req); 
                    }); 
                }
            } else {
                return logger.logResponse(200, "Saved Successfully.", null, res, req);
            }
        })
    };

    function getStartAndEndDates(start, end, endDateRange, repeatType, callback) {
        var startDatesArray = [];
        var endDateArray = [];
        var count = 0;
        if(repeatType == 'EVERY_MONTH') {   
            while(end <= endDateRange) {
                startDatesArray.push(start);
                endDateArray.push(end);
                start = moment(start).add(1, 'M').valueOf();
                end = moment(end).add(1, 'm').valueOf(); 
            }
        } else if(repeatType == 'EVERY_WEEK') {   
            while(end <= endDateRange) {
                startDatesArray.push(start);
                endDateArray.push(end);
                start = moment(start).add(7, 'days').valueOf();
                end = moment(end).add(7, 'days').valueOf(); 
            }
        } if(repeatType == 'EVERY_YEAR') {   
            while(end <= endDateRange) {
                startDatesArray.push(start);
                endDateArray.push(end);
                start = moment(start).add(1, 'y').valueOf();
                end = moment(end).add(1, 'y').valueOf(); 
            }
        } if(repeatType == 'EVERY_DAY') {   
            while(end <= endDateRange) {
                startDatesArray.push(start);
                endDateArray.push(end);
                start = moment(start).add(1, 'days').valueOf();
                end = moment(end).add(1, 'days').valueOf(); 
            }
        }
        var result =  {startTimes : startDatesArray, endTimes : endDateArray};
        callback(result);
    };

    controller.getActivities = function(req, res, next) {
        console.log("-------------------------------------------------------------------------------");
        var obj = {};
        obj.accountId = req.headers.accountId;
        obj.active = true;
        activityDAO.findAll(obj, req, res, function(data, error, req, res) {
            console.log("-------------------------------------AAA----------------------------------------");
            if(error) {
                console.log("--------------------------------BB---------------------------------------------");
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            var results = [];
            if(data == null || data.length == 0) {
                console.log("--------------------------------CC---------------------------------------------");
                return logger.logResponse(200, results, null, res, req);
            }
            async.mapSeries(data, function (activity, cb) {
                console.log("--------------------------------DD---------------------------------------------");
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
                console.log("--------------------------------FF---------------------------------------------");
                setTimeout(function() {
                    cb(); });
                }, 10);
                    
            });
            console.log("--------------------------------EE---------------------------------------------");
            return logger.logResponse(200, results, null, res, req);
        })
    };

    controller.deleteActivity = function(req, res, next) {
        var query = "";
        if(req.body.id != null) {
            query = "update activity a set a.active = 0  where a.id = "+req.body.id+" and a.accountId="+req.headers.accountId;
        } else {
            query = "update activity a set a.active = 0  where a.code = "+req.body.code+" and a.accountId="+req.headers.accountId;
        }
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                return logger.logResponse(500, "Error Occurred.", error, res, req);
            }
            return logger.logResponse(200, "Successfully Deleted.", null, res, req);    
        });
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
