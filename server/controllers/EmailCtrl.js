var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var mailer = require('../lib/Mailer.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function (app) {
    var controller = {};
    controller.sendEmailToServer = function(req, res, next) {
        var obj = {};
        obj.to = req.body.to;
        obj.subject = req.body.subject;
        obj.msg = req.body.msg;
        mailer.sendMail('', obj, function(statusCode, response, error) {
            if(error){
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, "Sent Successfully.", null, res, req);   
        });  
    }
	controller.sendEmail = function(req, res, next) {
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var emailCreditLeft = parseInt(data.email_credit);
            if(emailCreditLeft > 0) {
                var obj = {};
                obj.to = req.body.to;
                obj.subject = req.body.subject;
                obj.msg = req.body.msg;
                obj.memberId = req.body.memberId;
                mailer.sendMail('MESSAGE', obj, function(statusCode, response, error) {
                    if(error){
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    accountDAO.update(req.headers.accountId, {email_credit : (emailCreditLeft - 1)}, req, res, function(data, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, "Error Occured.", error, res, req);
                        } else {
                            return logger.logResponse(200, "Sent Successfully.", null, res, req);
                        }
                    });
                });    
            } else {
                return logger.logResponse(400, "You account dont have enough credits to send Email. Please top up credits to send Email.", "Dont have enough credits to send EMAIL. Please top up credits to send EMAIL.", res, req);
            }
        }); 
    }
	return controller;
}
