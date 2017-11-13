var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');

module.exports = function (app) {
	var controller = {};

	controller.login = function (req, res, next) {
		schema.model('User').forge()
            .where({
                username : req.body.username,
                active : true,
                password : encryptionService.encrypt(req.body.password)
            })
            .fetch().then(function(result) {
                if (result == null) {
                    return logger.logResponse(404, "No Record Found.", "No Record Found with given username : "+req.body.username, res, req);
                } else {
                    return saveUserSession(req, res, result.toJSON());
                }
            }).catch(function(err) {
				return logger.logResponse(500, "Error Occured.", err, res, req);
            })
	}

	controller.logout = function (req, res, next) {
		schema.model('UserSession').forge().query(function(qb) {
			qb.where({
				uuid: req.headers.uuid
			}).del().then(function(deletedSession) {
				if (deletedSession > 0) {
					return logger.logResponse(200, {"response" : "Logout Successfully."}, null, res, req);
				} else {
					return logger.logResponse(200, "No Record Found.", "No Record Found", res, req);
				}    
			}).catch(function(err) {
				return logger.logResponse(500, "Error Occured.", err, res, req);
			})
		})
	}

	function saveUserSession(req, res, user) {
        var sessionObj = {};
		sessionObj.username = req.body.username;
		sessionObj.password = encryptionService.encrypt(req.body.password);
		sessionObj.lasthit = moment().unix();
		sessionObj.active = true;
		sessionObj.uuid = uuidv1();
		sessionObj.accountId = user.accountId;
		schema.model('UserSession').forge().save(sessionObj).then(function (result) {
            return logger.logResponse(200, {accountId : sessionObj.accountId, uuid : sessionObj.uuid}, null, res, req);
        }).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
        })
    }

	return controller;
}
