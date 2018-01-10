var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('MembershipPlan').forge().save(obj).then(function(plan) {
            if(plan == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(plan.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, accountId, obj, req, res, callback) {
        schema.model('MembershipPlan').forge().where({
            id: id,
            accountId: accountId
		}).fetch().then(function (plan) {
			if (plan) {
                plan.save(obj, {
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
        schema.model('MembershipPlan').forge().where({
            id: id,
            accountId : req.headers.accountId
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('MembershipPlan').forge().where({
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
    findAll : function(id, req, res, callback) {
        schema.model('MembershipPlan').forge().where({
            active: 1
		}).orderBy('name', 'ASC').fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    getPlanDetailsById : function(id, accountId, req, res, callback) {
        schema.model('MembershipPlan').forge().query( function(qb) {
            qb.leftJoin('rates_to_membership_plan', function() {
                this.on('rates_to_membership_plan.membership_plan_id', '=', 'membership_plan.id')
            })
            .where('membership_plan.id', id)
            .andWhere('membership_plan.accountId', accountId)
            .column('membership_plan.id as id', 'membership_plan.name','membership_plan.typeId', 'membership_plan.description', 'membership_plan.active', 'membership_plan.accountId',
            'rates_to_membership_plan.id as ratePlanId', 'rates_to_membership_plan.amount', 'rates_to_membership_plan.signup_fee')
            .orderBy('rates_to_membership_plan.id', 'desc')
            .limit(1)
            .debug(false);
		}).fetch().then(function (plan) {
            if(plan == null) {
                callback(null, "No Record Found", req, res);
            }
            var result = plan.toJSON();
            result.amount = parseFloat(result.amount);
            result.signup_fee = parseFloat(result.signup_fee);
            callback(result, null, req, res);
		}).catch(function (err) {
            callback(null, err, req, res);
		});
    },
    findAllByAccountId : function(filter, req, res, callback) {
        if(filter.search == null) {
            filter.search = '';
        }
        schema.model('MembershipPlan').forge().query( function(qb) {
            qb.leftJoin('rates_to_membership_plan', function() {
                this.on('rates_to_membership_plan.membership_plan_id', '=', 'membership_plan.id')
            })
            .where('membership_plan.accountId', filter.accountId)
            .andWhere('membership_plan.active', filter.active)
            .andWhere('membership_plan.name', 'like', '%'+filter.search+'%')
            .column('membership_plan.id as id', 'membership_plan.name','membership_plan.typeId', 'membership_plan.description', 'membership_plan.active', `membership_plan.date_created`, 'membership_plan.accountId',
            'rates_to_membership_plan.id as ratePlanId', `membership_plan.accountId`, 'rates_to_membership_plan.amount', 'rates_to_membership_plan.signup_fee')
            .orderBy(filter.sortField, filter.sortOrder)
            .debug(true);
		}).fetchPage(commonUtils.getQueryObject(req)).then(function (plan) {
            var results = plan.toJSON();
            var uniqIds = [];
            var plans = [];
            var index = 0;
            console.log("Results.len  "+results.length)
            async.mapSeries(results, function (result, cb) {
                if(uniqIds.indexOf(result.id) < 0) {
                    uniqIds.push(result.id);
                    var obj = {};
                    obj.id = result.id;
                    obj.name = result.name;
                    obj.active = result.active;
                    obj.accountId = result.accountId;
                    obj.ratePlanId = result.ratePlanId;
                    obj.amount = parseFloat(result.amount);
                    obj.description = result.description;
                    obj.signup_fee = result.signup_fee != null ? parseFloat(result.signup_fee) : 0;
                    obj.typeId = result.typeId;
                    obj.dateCreated = (result.date_created != null && result.date_created != "" && !isNaN(result.date_created)) ? (result.date_created * 1000) : "";
                    plans.push(obj);
                }
                cb();
            });
            callback({data : plans, pagination : plan.pagination}, null, req, res);
		});
    },
    saveRateToPlan : function(obj, req, res, callback) {
        schema.model('RatesToMembershipPlan').forge().save(obj).then(function(rate_plan) {
            if(rate_plan == null) {
                callback(null, "Error Occurred.", req, res);
            }
            callback(rate_plan.toJSON(), null, req, res);
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    updateRateToPlan : function(id, obj, req, res, callback) {
        schema.model('RatesToMembershipPlan').forge().where({
            id: id
        }).fetch().then(function (rate_plan) {
            if (rate_plan) {
                rate_plan.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (rate_plan_result) {
                    if(rate_plan_result == null) {
                        callback(null, "Error Occurred.", req, res);
                    }
                    callback(rate_plan_result.toJSON(), null, req, res);    
                }).catch(function (err) {
                    callback(null, err, req, res);
                });
            } else {
                callback(null, "No Record Found.", req, res);
            }
        }).catch(function (err) {
            callback(null, err, req, res);
        });
    }

}