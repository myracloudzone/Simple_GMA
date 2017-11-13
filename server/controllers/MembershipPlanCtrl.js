var schema = require('bookshelf').DB;
var async = require('async');
var connection = require('../scripts/db.js');
var logger = require('../scripts/logger.js');
var commonUtils = require("./CommonCtrl.js");
var moment = require('moment');

module.exports = function(app) {
    var controller = {};
    controller.deletePlanById = function(req, res, next) {
        req.body.accountId = req.headers.accountId; // Need to be updated.
        schema.model('MembershipPlan').forge().where({
            id: req.body.id,
            accountId : req.body.accountId
		}).fetch().then(function (plan) {
			if (plan) {
                plan.save({
                    active: false
                }, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    return logger.logResponse(200, "Deleted Successfully.", null, res, req);
                }).catch(function (err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                });
			} else {
				return logger.logResponse(404, "No Record Found.", err, res, req);
			}
		}).catch(function (err) {
			return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    }

    controller.getPlanById = function(req, res, next) {
        req.query.accountId = req.headers.accountId; // Need to be updated.
        schema.model('MembershipPlan').forge().query( function(qb) {
            qb.leftJoin('rates_to_membership_plan', function() {
                this.on('rates_to_membership_plan.membership_plan_id', '=', 'membership_plan.id')
            })
            .where('membership_plan.id', req.query.id)
            .andWhere('membership_plan.accountId', req.query.accountId)
            .column('membership_plan.id as id', 'membership_plan.name','membership_plan.typeId', 'membership_plan.description', 'membership_plan.active', 'membership_plan.accountId',
            'rates_to_membership_plan.id as ratePlanId', 'rates_to_membership_plan.amount', 'rates_to_membership_plan.signup_fee')
            .orderBy('rates_to_membership_plan.id', 'desc')
            .limit(1)
            .debug(false);
		}).fetch().then(function (plan) {
            var result = plan.toJSON();
            result.amount = parseFloat(result.amount);
            result.signup_fee = parseFloat(result.signup_fee);
			return logger.logResponse(200, result, null, res, req);
		}).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    }

    controller.getPlans = function(req, res, next) {
        req.query.accountId = req.headers.accountId // Need to be updated.
        schema.model('MembershipPlan').forge().query( function(qb) {
            qb.leftJoin('rates_to_membership_plan', function() {
                this.on('rates_to_membership_plan.membership_plan_id', '=', 'membership_plan.id')
            })
            .where('membership_plan.accountId', req.query.accountId)
            .andWhere('membership_plan.active', 1)
            .column('membership_plan.id as id', 'membership_plan.name','membership_plan.typeId', 'membership_plan.description', 'membership_plan.active', `membership_plan.date_created`, 'membership_plan.accountId',
            'rates_to_membership_plan.id as ratePlanId', `membership_plan.accountId`, 'rates_to_membership_plan.amount', 'rates_to_membership_plan.signup_fee')
            .orderBy('membership_plan.name', 'asc')
            .debug(true);
		}).fetchPage(commonUtils.getQueryObject(req)).then(function (plan) {
            console.log(plan)
            var results = plan.toJSON();
            var uniqIds = [];
            var plans = [];
            async.mapSeries(results, function (result, cb) {
                console.log(uniqIds.indexOf(result.id) < 0)
                console.log("-----"+uniqIds.indexOf(result.id));
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
            return logger.logResponse(200, {data : plans, pagination : plan.pagination}, null, res, req); 
		}).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    }

    controller.addPlan = function(req, res, next) {
        req.body.accountId = req.headers.accountId // Need to be updated.
        var now = moment().unix();
        var obj = {};
        obj.name = req.body.name;
        obj.active = true;
        obj.accountId = req.body.accountId;
        obj.typeId = req.body.typeId;
        obj.description = req.body.description;
        obj.date_created = now;
        schema.model('MembershipPlan').forge().save(obj).then(function(plan) {
            if (plan) {
                var result = plan.toJSON();
                obj = {};
                obj.membership_plan_id = result.id;
                obj.amount = req.body.amount;
                obj.accountId = req.body.accountId; // Need to be updated.
                obj.signup_fee = req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0;
                schema.model('RatesToMembershipPlan').forge().save(obj).then(function(rate_plan) {
                    if (rate_plan) {
                        var plan_data = {'plan' : plan.toJSON(), 'rate_plan' : rate_plan.toJSON()};
                        return logger.logResponse(200, plan_data, null, res, req);
                    } else {
                        return logger.logResponse(500, "Error Occured.", "Not able to add a new RatesToMembershipPlan", res, req);
                    }
                }).catch(function(err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                })
            } else {
                return logger.logResponse(500, "Error Occured.", "Not able to add a new MembershipPlan", res, req);
            }
        }).catch(function(err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
        })
    }

    controller.updatePlan = function(req, res, next) {
        req.body.accountId = req.headers.accountId // Need to be updated.
        schema.model('MembershipPlan').forge().where({
            id : req.body.id,
            accountId : req.body.accountId 
		}).fetch().then(function (plan) {
			if (plan) {
				plan.save({
                    name : req.body.name,
                    description : req.body.description
                }, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(req.body.isNewEntry == null || req.body.isNewEntry != true) {
                        schema.model('RatesToMembershipPlan').forge().where({
                            id: req.body.ratePlanId
                        }).fetch().then(function (rate_plan) {
                            if (rate_plan) {
                                rate_plan.save({
                                    amount : req.body.amount,
                                    signup_fee : req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0
                                }, {
                                    method: 'update',
                                    patch: true,
                                    require: false
                                }).then(function (rate_plan_result) {
                                    var plan_data = {'plan' : result.toJSON(), 'rate_plan' : rate_plan_result.toJSON()};
                                    return logger.logResponse(200, plan_data, null, res, req);
                                }).catch(function (err) {
                                    return logger.logResponse(500, "Error Occured.", err, res, req);
                                });
                            } else {
                                return logger.logResponse(500, "Error Occured.", "Not able to update RatesToMembershipPlan", res, req);
                            }
                        }).catch(function (err) {
                            return logger.logResponse(500, "Error Occured.", err, res, req);
                        });
                    } else {
                        obj = {};
                        obj.membership_plan_id = req.body.id;
                        obj.amount = req.body.amount;
                        obj.accountId = req.body.accountId; // Need to be updated.
                        obj.signup_fee = req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0;
                        schema.model('RatesToMembershipPlan').forge().save(obj).then(function(rate_plan_result) {
                            if (rate_plan_result) {
                                var plan_data = {'plan' : result.toJSON(), 'rate_plan' : rate_plan_result.toJSON()};
                                return logger.logResponse(200, plan_data, null, res, req);
                            } else {
                                return logger.logResponse(500, "Error Occured.", "Not able to update RatesToMembershipPlan", res, req);
                            }
                        }).catch(function(err) {
                            return logger.logResponse(500, "Error Occured.", err, res, req);
                        })
                    }
                }).catch(function (err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                });
			} else {
                return logger.logResponse(404, "No Record Found.", "No Record Found.", res, req);
			}
		}).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    }
    return controller;
}