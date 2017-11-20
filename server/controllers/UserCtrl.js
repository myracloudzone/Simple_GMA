var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var mailer = require('../lib/Mailer.js');
var userDAO = require('../dao/UserDAO.js');
var encryptionService = require("../lib/EncryptionDecryption.js");

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
	return controller;
}