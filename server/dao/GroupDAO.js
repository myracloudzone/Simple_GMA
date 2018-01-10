var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Group').forge().save(obj).then(function(group) {
            if(group == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(group.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, accountId, obj, req, res, callback) {
        schema.model('Group').forge().where({
            id: id,
            accountId: accountId
		}).fetch().then(function (group) {
			if (group) {
                group.save(obj, {
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
        schema.model('Group').forge().where({
            id: id,
            accountId : req.headers.accountId
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('Group').forge().where({
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
    countAll : function(filter, req, res, callback) {
        var query = "";
        if(filter.search == null || filter.search == '') {
            query = 'SELECT count(*) as total FROM half_dome_gym_app.`group` g  where g.accountId = '+filter.accountId+'';
        } else {
            query = 'SELECT count(*) as total from half_dome_gym_app.`group` g where g.accountId = '+filter.accountId+' and name like \'%'+filter.search+'%\';';
        }
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                callback(null, error, req, res);
            }
            if(data == null) {
                callback([], null, req, res);
            }
            var count = 0;
            
            async.mapSeries(data, function (row, cb) {
                count = row.total;
                cb();
            });
            callback(count, null, req, res);
        })
        
    },
    assignGroupToMember : function(filter, req, res, callback) {
        var query = "update member m set m.group = null where m.group = "+filter.groupId+";";
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                callback(null, error, req, res);
            }
            var memberIds = filter.memberIds;
            if(memberIds == null || memberIds.length == 0) {
                callback("Successfully Updated.", null, req, res);
            } else {
                query = "update member m set m.group = "+filter.groupId+" where m.id in ("+memberIds+");";
                commonUtils.makeDBRequest(query, function(error, data) {
                    if(error) {
                        callback(null, error, req, res);
                    }
                    callback("Successfully Updated.", null, req, res);
                })
            }
            
            
        })
    },    
    findAll : function(filter, req, res, callback) {
        if(filter.sortField == null) {
            filter.sortField = 'name';
        } 
        if(filter.sortOrder == null) {
            filter.sortOrder = 'ASC';
        }
        var query = "";
        if(filter.search == null || filter.search == '') {
            query = 'SELECT g.id, g.name, g.description, g.icon_url, g.accountId, COUNT(m.member_code) AS memberCount FROM half_dome_gym_app.`group` g left join member m on (m.group = g.id) where g.accountId = '+filter.accountId+' GROUP BY g.id order by '+filter.sortField+' '+filter.sortOrder;
        } else {
            query = 'SELECT g.id, g.name, g.description, g.icon_url, g.accountId, COUNT(m.member_code) AS memberCount FROM half_dome_gym_app.`group` g left join member m on (m.group = g.id) where g.accountId = '+filter.accountId+' and name like \'%'+filter.search+'%\' GROUP BY g.id order by '+filter.sortField+' '+filter.sortOrder;
        }
        if(filter.pageLimit != null && filter.pageOffset != null) {
            query = query + ' LIMIT '+filter.pageLimit+' OFFSET '+filter.pageOffset+';';
        } 
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                callback(null, error, req, res);
            }
            if(data == null) {
                callback([], null, req, res);
            }
            var result = [];

            async.mapSeries(data, function (row, cb) {
                var obj = {};
                obj.id = row.id;
                obj.name = row.name;
                obj.description = row.description;
                obj.icon_url = row.icon_url;
                obj.accountId = row.accountId;
                obj.memberCount = row.memberCount;
                result.push(obj);
                cb();
            });
            callback(result, null, req, res);
        })
        
    }    
}