var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('TempPassword').forge().save(obj).then(function(password) {
            if(password == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(password.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    find : function(id, req, res, callback) {
        schema.model('TempPassword').forge().where({
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
    findByUsernameAndTypeId : function(username, typeId, time, req, res, callback) {
        var query = 'SELECT * FROM temp_password WHERE username = \''+username+'\' and expireTime > '+time+' and typeId = '+typeId+' order by expireTime desc limit 1';
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                callback(null, error, req, res);
            }
            if(data == null) {
                callback([], null, req, res);
            }
            var result = {};

            async.mapSeries(data, function (row, cb) {
                var obj = {};
                obj.id = row.id;
                obj.username = row.username;
                obj.typeId = row.typeId;
                obj.password = row.password;
                obj.expireTime = row.expireTime;
                result = obj;
                cb();
            });
            callback(result, null, req, res);
        })
    },
}