var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');

module.exports = function (app) {
	var controller = {};
	controller.createField = function(req, res, next) {
        var now = moment().unix();
        var obj = {};
        obj.module_id = req.body.module_id;
        obj.type_id = req.body.typeId;
        obj.name = req.body.name;
        obj.code = req.body.code;
        obj.required = req.body.required;
        obj.description = req.body.description;
        obj.active = true;
        obj.date_created = now;
        obj.accountId = req.headers.accountId;
        obj.class = req.body.class;
        schema.model('CustomField').forge().save(obj).then(function(custom_field) {
            if(custom_field != null) {
                custom_field = custom_field.toJSON();
                if(req.body.typeId == 4 || req.body.typeId == 5 || req.body.typeId == 6 || req.body.typeId == 7) {
                    var custom_field_response = [];
                    async.mapSeries(req.body.response, function (response, cb) {
                        obj = {};
                        obj.custom_field_id = custom_field.id;
                        obj.name = response.name;
                        obj.value = response.value;
                        obj.code = response.code;
                        obj.is_default = response.is_default;
                        obj.accountId = req.headers.accountId;
                        schema.model('CustomFieldOption').forge().save(obj).then(function(custom_field_option) {
                            var result = custom_field_option.toJSON();
                            custom_field_response.push(result);
                            cb();
                        }).catch(function(err) {
                            return logger.logResponse(500, "Error Occured.", err, res, req);
                        })
                    }, function (err, result) {
					    custom_field.response = custom_field_response;
                        return logger.logResponse(200, custom_field, null, res, req);
				    }) 
                } else {
                    return logger.logResponse(200, custom_field, null, res, req);
                }
            } else {
                return logger.logResponse(500, "Error Occured.", "No able to save.", res, req);
            }
        }).catch(function(err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
        })
    }
	return controller;
}
