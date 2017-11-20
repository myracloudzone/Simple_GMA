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
	controller.getAccountById = function(req, res, next) {
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req); 
        }); 
    }
	return controller;
}
