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
            username : username,
            active : true
        }).fetch().then(function (result) {
            if(result == null) {
                callback(null, "No Record Found.", req, res);
            } else {
                callback(result.toJSON(), null, req, res);
            }
		}).catch(function (err) {
			callback(null, err, req, res);
        });
    },
    save : function(obj, req, res, callback) {
        schema.model('User').forge().save(obj).then(function(user) {
            if(user == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(user.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    findByUsername : function(username, req, res, callback) {
        schema.model('User').forge().where({
            username: username
		}).fetch().then(function (result) {
            if(result == null) {
                callback({}, null, req, res);
            } else {
                callback(result.toJSON(), null, req, res);
            }
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findAllByAccountId : function(filter, req, res, callback) {
        if(filter.search == null) {
            filter.search = '';
        }
        schema.model('User').forge().query( function(qb) {
            qb.where('user.accountId', filter.accountId)
            .andWhere('user.active', filter.active)
            .andWhere('user.name', 'like', '%'+filter.search+'%')
            .orderBy(filter.sortField, filter.sortOrder)
            .debug(true);
		}).fetchPage(commonUtils.getQueryObject(req)).then(function (users) {
            var results = users.toJSON();
            var userArray = [];
            async.mapSeries(results, function (result, cb) {
                var obj = {};
                obj.id = result.id;
                obj.name = result.name;
                obj.active = result.active;
                obj.accountId = result.accountId;
                obj.username = result.username;
                obj.email = result.email;
                obj.roleId = result.roleId;
                obj.dateCreated = result.dateCreated;
                obj.mobile = result.mobile;
                userArray.push(obj);
                cb();
            });
            callback({data : userArray, pagination : users.pagination}, null, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('User').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback(null, "No Record Found", req, res);
            } else {
                callback(result.toJSON(), null, req, res);
            }
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    update : function(id, accountId, obj, req, res, callback) {
        schema.model('User').forge().where({
            id: id,
            accountId: accountId
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
}