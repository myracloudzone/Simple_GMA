var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var mailer = require('../lib/Mailer.js');
var userDAO = require('../dao/UserDAO.js');
var encryptionService = require("../lib/EncryptionDecryption.js");
var commonUtils = require("./CommonCtrl.js");
var mailer = require('../lib/Mailer.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function (app) {
    var controller = {};
	controller.getLoggedInUser = function(req, res, next) {
        userDAO.findByUserName(req.headers.username, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            var response = {};
            response.username = data.username;
            response.id = data.id;
            response.active = data.active;
            response.email = data.email;
            response.roleId = data.roleId;
            return logger.logResponse(200, response, null, res, req); 
        }); 
    };
    controller.list = function(req, res, next) {
        var filter = {};
        if(req.query.sortField == null || req.query.sortField == '') {
            filter.sortField = 'name';
            filter.sortOrder = 'asc';
        } else {
            filter.sortField = req.query.sortField;
            filter.sortOrder = req.query.sortOrder;
        }
        filter.search = req.query.search;
        filter.accountId = req.headers.accountId;
        filter.active = req.query.active != null ? (req.query.active == true || req.query.active == 'true') ? 1 : 0 : 1;
        userDAO.findAllByAccountId(filter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            return logger.logResponse(200, data, null, res, req); 
        })
    };
    controller.changePassword = function(req, res, next) {
        if(req.body.username == null || req.body.username == '') {
            return logger.logResponse(400, {errorMessage : "Username is required." }, "Username is required.", res, req);
        } else if(req.body.currentPassword == null || req.body.currentPassword == '') {
            return logger.logResponse(400, {errorMessage : "Current Password is required."}, "Current Password is required.", res, req);
        } else if(req.body.newPassword == null || req.body.newPassword == '') {
            return logger.logResponse(400, {errorMessage : "New Password is required." }, "New Password is required.", res, req);
        } else if(req.body.newPassword.length > 50) {
            return logger.logResponse(400, {errorMessage : "New Password can be of maximum 50 character."}, "New Password can be of maximum 50 character.", res, req);
        }
        userDAO.findByUserName(req.body.username, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            var currentPassword = encryptionService.decrypt(data.password);
            if(currentPassword != req.body.currentPassword) {
                return logger.logResponse(400, {errorMessage : "Invalid Current Password." }, "Invalid Current Password.", res, req);
            }
            var obj = {password : encryptionService.encrypt(req.body.newPassword)};
            userDAO.update(req.body.username, obj, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, error, error, res, req);
                }
                return logger.logResponse(200, "Password Changed Successfully.", null, res, req); 
            })
        }); 
    };
    controller.getUser = function(req, res, next) {
        userDAO.find(req.query.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            if(data  != null && data.id != null) {
                delete data.password;
                if(data.dateOfJoining != null) {
                    data.joiningDateString = moment(parseFloat(data.dateOfJoining)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    data.joiningDateString = null;
                }
                if(data.dob != null) {
                    data.dobString = moment(parseFloat(data.dob)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    data.dobString = null;
                }
            }
            return logger.logResponse(200, data, null, res, req);
        });
    };
    controller.updateUser = function(req, res, next) {
        var obj = {};
        obj.id = req.body.id;
        obj.name = req.body.name;
        obj.roleId = req.body.roleId;
        if(req.body.dobString != null && req.body.dobString != '') {
            obj.dob = moment(req.body.dobString, "DD/MM/YYYY HH:mm:ss").valueOf();
        } else {
            obj.dob = null;
        }
        if(req.body.joiningDateString != null && req.body.joiningDateString != '') {
            obj.dateOfJoining = moment(req.body.joiningDateString, "DD/MM/YYYY HH:mm:ss").valueOf();
        } else {
            obj.dateOfJoining = null;
        }
        obj.mobile = req.body.mobile;
        obj.name = req.body.name;
        obj.dateCreated = moment().valueOf();
        userDAO.update(obj.id, req.headers.accountId, obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            if(data  != null && data.id != null) {
                delete data.password;
                if(data.dateOfJoining != null) {
                    data.joiningDateString = moment(parseFloat(data.dateOfJoining)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    data.joiningDateString = null;
                }
                if(data.dob != null) {
                    data.dobString = moment(parseFloat(data.dob)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    data.dobString = null;
                }
            }
            return logger.logResponse(200, data, null, res, req);
        })
    };
    controller.deleteUser = function(req, res, next) {
        userDAO.find(req.body.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            if(data  != null && data.id != null) {
                if(data.roleId == 1) {
                    return logger.logResponse(500, "Root User cannot be deleted.", "Root User cannot be deleted.", res, req);
                } else {
                    var obj = {};
                    obj.active = false;
                    userDAO.update(req.body.id, req.headers.accountId, obj, req, res, function(data, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, "Error Occured.", error, res, req);
                        }
                        return logger.logResponse(200, "Deleted Successfully.", null, res, req);
                    })
                }
            } else {
                return logger.logResponse(404, "No record found.", "No record found.", res, req);
            }
        });
    };
    controller.createUser = function(req, res, next) {
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var userCreditLeft = parseInt(data.userCredit);
            if(userCreditLeft > 0) {
                userDAO.findByUsername(req.body.email, req, res, function(existingUser, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, error, error, res, req);
                    }
                    if(existingUser.id != null) {
                        return logger.logResponse(500, "Username already taken. Please choose a different username.", "Username already taken. Please choose a different username.", res, req);
                    }
                    var password = encryptionService.decrypt(commonUtils.getUniqueCode(6));
                    var obj = {};
                    obj.name = req.body.name;
                    obj.username = req.body.email;
                    obj.email = req.body.email;
                    obj.password = password;
                    obj.active = 1;
                    obj.accountId = req.headers.accountId;
                    obj.roleId = req.body.roleId;
                    if(req.body.dobString != null && req.body.dobString != '') {
                        obj.dob = moment(req.body.dobString, "DD/MM/YYYY HH:mm:ss").valueOf();
                    }
                    if(req.body.joiningDateString != null && req.body.joiningDateString != '') {
                        obj.dateOfJoining = moment(req.body.joiningDateString, "DD/MM/YYYY HH:mm:ss").valueOf();
                    }
                    obj.mobile = req.body.mobile;
                    obj.name = req.body.name;
                    obj.dateCreated = moment().valueOf();
                    obj.dateModified = moment().valueOf();
                    userDAO.save(obj, req, res, function(user, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, error, error, res, req);
                        }
                        var emailData = { password : password };
                        mailer.sendMail('USER_REGISTRATION', emailData, function() {
                            // Handle any case
                        });
                        delete user.password;
                        accountDAO.update(req.headers.accountId, {userCredit : (userCreditLeft - 1)}, req, res, function(data, error, req, res) {
                            if(error) {
                                return logger.logResponse(500, error, error, res, req);
                            }
                            return logger.logResponse(200, user, null, res, req);
                        });      
                    })
                });  
            } else {
                return logger.logResponse(400, "You account dont have enough credits to create new User. Please top up credits to create new User.", "You account dont have enough credits to create new User. Please top up credits to create new User.", res, req);
            }
        }); 
    }
	return controller;
}