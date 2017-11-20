var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Account').forge().save(obj).then(function(account) {
            if(account == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(account.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, obj, req, res, callback) {
        schema.model('Account').forge().where({
            id: id
		}).fetch().then(function (account) {
			if (account) {
                account.save(obj, {
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
    delete : function(id, req, res, callback) {
        schema.model('Account').forge().where({
            id: id
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('Account').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback(null, "No Record Found", req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findAll : function(id, req, res, callback) {
        schema.model('Account').forge().where({
            active: 1
		}).orderBy('name', 'ASC').fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    }
}