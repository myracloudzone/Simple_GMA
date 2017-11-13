var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var mailer = require('../lib/Mailer.js');

module.exports = function (app) {
    var controller = {};
	controller.sendEmail = function(req, res, next) {
        var obj = {};
        obj.to = req.body.to;
        obj.subject = req.body.subject;
        obj.msg = req.body.msg;
        obj.memberId = req.body.memberId;
        mailer.sendMail('MESSAGE', obj);
        res.send("Sent");
    }
	return controller;
}
