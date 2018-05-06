var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var commonUtils = require("./CommonCtrl.js");

module.exports = function (app) {
	var controller = {};

	controller.getYouTubeInformation = function (req, res, next) {
		commonUtils.getYouTubeVideoDetails(req.query.id, function(data, statusCode) {
            return logger.logResponse(200, {"response" : data}, null, res, req);
        });
	}
	return controller;
}
