var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Activity').forge().save(obj).then(function(activity) {
            if(activity == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(activity.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    findAll : function(condition, req, res, callback) {
        console.log("--------------------------------DAO---------------------------------------------");
        schema.model('Activity').forge().where(condition).orderBy('name', 'ASC').fetchAll().then(function (result) {
            console.log("--------------------------------DAO1---------------------------------------------");
            if(result == null) {
                console.log("--------------------------------DAO2---------------------------------------------");
                callback([], null, req, res);
            }
            console.log("--------------------------------DAO3---------------------------------------------");
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
            console.log("--------------------------------DAO4---------------------------------------------");
			callback(null, err, req, res);
		});
    },
    update : function(condition, obj, req, res, callback) {
        schema.model('Activity').forge().where(condition).fetch().then(function (activity) {
			if (activity) {
                activity.save(obj, {
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
}