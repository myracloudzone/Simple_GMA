var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var commonUtils = require("./CommonCtrl.js");
var passwordDAO = require('../dao/PasswordDAO.js');
var userDAO = require('../dao/UserDAO.js');
var moment = require('moment');
var smsSender = require('../lib/SmsSender.js');
var encryptionService = require("../lib/EncryptionDecryption.js");

module.exports = function(app) {
    var controller = {};
    controller.updateUserPassword = function(req, res, next) {
        var currentTime = moment().valueOf();
        passwordDAO.findByUsernameAndTypeId(req.body.username, 1, currentTime, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, {"message" : "No record found for given request or your OTP has been expired."}, "No record found for given request." , res, req);
            }
            if(req.body.password == null || req.body.password.length > 50) {
                return logger.logResponse(404, {"message" : "Password should be minimum of 8 character and should not exceed 50 characters."}, "Incorrect OTP. Please provide a valid OTP." , res, req);
            }
            if(data.password != req.body.OTP) {
                return logger.logResponse(404, {"message" : "Incorrect OTP. Please provide a valid OTP."}, "Incorrect OTP. Please provide a valid OTP." , res, req);
            }
            if(data.expireTime < currentTime) {
                return logger.logResponse(404, {"message" : "Your OTP has been expired. Please regenerate a new OTP."}, "Your OTP has been expired. Please regenerate a new OTP." , res, req);
            }
            var obj = {};
            obj.password = encryptionService.encrypt(req.body.password);
            userDAO.update(req.body.username, obj, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, error, error, res, req);
                }
                return logger.logResponse(200, {"message" : "Password changed successfully."}, null , res, req);
            })
        })
    };

    controller.generateLoginOTP = function(req, res, next) {
        userDAO.findByUserName(req.body.username, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(404, error, error, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, {message : "No user exists with given Username.", warning : ""}, error, res, req);
            } else {
                var member = data;
                var OTP = commonUtils.getUniqueCode(6);
                var obj = {};
                obj.username = req.body.username;
                obj.typeId = 1;
                obj.password = OTP;
                obj.expireTime = moment().add(10, 'm').valueOf();
                passwordDAO.save(obj, req, res, function(data, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    var msg = "Dear User, your OTP for the request of changing password is "+OTP+". It will expire in 10 minutes.\n Thank You!!";
                    smsSender.sendMessage(member.mobile, msg, req, res, function(data, statusCode, req, res) {
                        if(statusCode == 200) {
                            return logger.logResponse(200, {message : "OTP Sent Successfully.", warning : ""}, error, res, req);                            
                        } else {
                            return logger.logResponse(500, {message : "Error occurred while sending message.", warning : ""}, error, res, req);
                        }
                    });
                })
            }
        }); 
    };
    return controller;
};