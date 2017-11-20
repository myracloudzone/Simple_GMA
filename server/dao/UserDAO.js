var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    update : function(username, obj, req, res, callback) {
        schema.model('User').forge().where({
            username: username
		}).fetch().then(function (user) {
			if (user) {
                user.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(result != null) {
                        callback(result.toJSON(), null, req, res);
                    } else {
                        callback(null, "Error Occurred.", req, res);
                    }
                }).catch(function (err) {
                    callback(null, err, req, res);
                });
			} else {
				callback(null, "Error Occurred.", req, res);
			}
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findByUserName : function(username, req, res, callback) {
        schema.model('User').forge().where({
            username : username
        }).fetch().then(function (result) {
            if(result == null) {
                callback(null, "No Record Found.", req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
        });
    }    
}