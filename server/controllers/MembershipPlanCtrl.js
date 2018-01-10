var schema = require('bookshelf').DB;
var async = require('async');
var connection = require('../scripts/db.js');
var logger = require('../scripts/logger.js');
var commonUtils = require("./CommonCtrl.js");
var moment = require('moment');
var planDAO = require('../dao/PlanDAO.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function(app) {
    var controller = {};
    controller.deletePlanById = function(req, res, next) {
        planDAO.update(req.body.id, req.headers.accountId, {active : false}, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            return logger.logResponse(200, "Deleted Successfully.", null, res, req);
        })
    }

    controller.getPlanById = function(req, res, next) {
        planDAO.getPlanDetailsById(req.query.id, req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    }

    controller.getPlans = function(req, res, next) {
        var filter = {};
        filter.accountId = req.headers.accountId;
        if(req.query.sortField == null || req.query.sortField == '') {
            filter.sortField = "membership_plan.name";
            filter.sortOrder = 'ASC';
        } else {
            filter.sortField = req.query.sortField;
            filter.sortOrder = req.query.sortOrder;
        }
        if(req.query.search != null) {
            filter.search = req.query.search;
        }
        if(req.query.active == null) {
            filter.active = true;
        } else {
            filter.active = req.query.active;
        }
        console.log(filter)
        planDAO.findAllByAccountId(filter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    }

    controller.addPlan = function(req, res, next) {
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var planCreditLeft = parseInt(data.plan_credit);
            if(planCreditLeft > 0) {
                var now = moment().unix();
                var obj = {};
                obj.name = req.body.name;
                obj.active = true;
                obj.accountId = req.headers.accountId;
                obj.typeId = req.body.typeId;
                obj.description = req.body.description;
                obj.date_created = now;
                planDAO.save(obj, req, res, function(planData, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    accountDAO.update(req.headers.accountId, {plan_credit : (planCreditLeft - 1)}, req, res, function(data, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, "Error Occured.", error, res, req);
                        } else {
                            obj = {};
                            obj.membership_plan_id = planData.id;
                            obj.amount = req.body.amount;
                            obj.accountId = req.headers.accountId;
                            obj.signup_fee = req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0;
                            obj.dateCreated = moment().valueOf();
                            planDAO.saveRateToPlan(obj, req, res, function(rateData, error, req, res) {
                                if(error) {
                                    return logger.logResponse(500, "Error Occured.", error, res, req);
                                }
                                var plan_data = {'plan' : planData, 'rate_plan' : rateData};
                                return logger.logResponse(200, plan_data, null, res, req);
                            })
                        }
                    });  
                })    
            } else {
                return logger.logResponse(400, "You account dont have enough credits to create new Membership Plan. Please top up credits to create Membership Plans.", "You account dont have enough credits to create new Membership Plan. Please top up credits to create Membership Plans.", res, req);
            }
        }); 
    }

    controller.updatePlan = function(req, res, next) {
        planDAO.update(req.body.id, req.headers.accountId, {name : req.body.name, description : req.body.description}, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            if(req.body.isNewEntry == null || req.body.isNewEntry != true) {
                planDAO.updateRateToPlan(req.body.ratePlanId, {
                    amount : req.body.amount,
                    signup_fee : req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0
                }, req, res, function(data1, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    var plan_data = {'plan' : data, 'rate_plan' : data1};
                    return logger.logResponse(200, plan_data, null, res, req);
                });
            } else {
                var obj = {};
                obj.membership_plan_id = req.body.id;
                obj.amount = req.body.amount;
                obj.accountId = req.headers.accountId; // Need to be updated.
                obj.signup_fee = req.body.signup_fee != null && req.body.signup_fee != '' ? req.body.signup_fee : 0;
                obj.dateCreated = moment().valueOf();
                planDAO.saveRateToPlan(obj, req, res, function(data2, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, "Error Occured.", error, res, req);
                    }
                    var plan_data = {'plan' : data, 'rate_plan' : data2};
                    return logger.logResponse(200, plan_data, null, res, req);
                });
            }
        })
    }
    return controller;
}