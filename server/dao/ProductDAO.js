var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Product').forge().save(obj).then(function(product) {
            if(product == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(product.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, accountId, obj, req, res, callback) {
        schema.model('Product').forge().where({
            id: id,
            accountId: accountId
		}).fetch().then(function (product) {
			if (product) {
                product.save(obj, {
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
    delete : function(id, accountId, req, res, callback) {
        schema.model('Product').forge().where({
            id: id,
            accountId : req.headers.accountId
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('Product').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback({}, null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findAll : function(condition, req, res, callback) {
        schema.model('Product').forge().where(condition).orderBy('name', 'ASC').fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
        });
    }    
}