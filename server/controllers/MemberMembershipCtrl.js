var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');

module.exports = function(app) {
    var controller = {};


    function getMembershipToMemberEntityById(id, req, res, callback) {
        schema.model('MembershipPlanToMember').forge().query( function(qb) {
            qb.leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
            })
            .where('membership_plan_to_member.is_current', true)
            .andWhere('membership_plan_to_member.member_id', id)
            .column('membership_rate_to_member.*')
            .debug(true);
        }).fetch().then(function (data) {
            callback(data, null);
        }).catch(function (err) {
            callback(null, err);
		});

    }

    function saveTransactionToMember(data, req, res, callback) {
        schema.model('MemberPaymentTransaction').forge().save(data).then(function(transaction) {
            callback(transaction, null);        
        }).catch(function(err) {
            callback(null, err);
        })

    }

    function updateDueAmountToMember(id, amount, req, res, callback) {
        schema.model('MembershipRateToMember').forge().where({
            id : id,
        }).fetch().then(function (plan) {
			if (plan) {
				plan.save({
                    due_amount : amount,
                }, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    callback(result, null);
                }).catch(function (err) {
                    callback(null, err);
                });
			}
		}).catch(function (err) {
            callback(null, err);
		});

    }

    controller.getMemebershipToMemberById = function(req, res, next) {
        getMembershipToMemberEntityById(req.query.id, req, res, function(data, err) {
            if(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            if(data == null) {
                return logger.logResponse(200, {}, null, res, req);
            }
            data = data.toJSON();
            var obj = {};
            obj.memberId = req.query.id;
            obj.membershipPlanToMemberId = data.membership_plan_to_member_id;
            obj.membershipPlanId = data.membership_plan_id;
            obj.rateToMembershipPlanId = data.rate_to_membership_plan_id;
            obj.amount = data.amount;
            obj.signupFeeApplied = data.signup_fee_applied;
            obj.signupFee = data.sign_up_fee;
            obj.dueAmount = data.due_amount;
            obj.isDue = data.is_due;
            return logger.logResponse(200, obj, null, res, req);
        })
    };

    controller.getMemberTransactionHistory = function(req, res, next) {
        var transaction_type = req.query.transactionType != null ? req.query.transactionType : 1;
        schema.model('MemberPaymentTransaction').forge().where({
            member_id : req.query.memberId,
            transaction_type : transaction_type
        }).orderBy('date_created', 'DESC').fetchAll().then(function (transactionHistory) {
			if(transactionHistory == null) {
                return logger.logResponse(200, [], null, res, req);
            } else {
                transactionHistory = transactionHistory.toJSON();
                var results = [];
                async.mapSeries(transactionHistory, function (history, cb) {
                    var obj = {};
                    obj.id = history.id;
                    obj.memberId = history.member_id;
                    obj.transactionType = history.transaction_type;
                    obj.amountPaid = history.amount_paid;
                    obj.amountDue = history.amount_due;
                    obj.description = history.description;
                    obj.dateCreated = parseInt(history.date_created) * 1000;
                    obj.membershipPlanId = history.membership_plan_id;
                    obj.membershipPlanToMemberId = history.membership_plan_to_member_id;
                    obj.membershipRateId = history.membership_rate_id;
                    obj.membershipRateToMemberId = history.membership_rate_to_member_id; 
                    results.push(obj);
                    cb();
                });
                return logger.logResponse(200, results, null, res, req);
            }
		}).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    }

    controller.addPayment = function(req, res, next) {
        getMembershipToMemberEntityById(req.body.memberId, req, res, function(data, err) {
            if(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            if(data == null) {
                return logger.logResponse(404, "No Member Found", "No Member Found", res, req);
            }
            data = data.toJSON();
            var originalAmountDue = data.due_amount;
            var amountPaid = req.body.amountPaid;
            if(amountPaid == null || amountPaid == '' || isNaN(amountPaid)) {
                return logger.logResponse(500, "Invalid Paid Amount.", "Invalid Paid Amount.", res, req);
            }
            amountPaid = parseFloat(amountPaid);
            if(amountPaid > originalAmountDue) {
                return logger.logResponse(500, "Amount Paid cannot be greater than total amount due.", "Invalid Data.", res, req);
            }
            if(amountPaid < 0) {
                return logger.logResponse(500, "Invalid Paid Amount.", "Invalid Paid Amount.", res, req);
            }
            var amountDue = originalAmountDue - amountPaid;
            var obj = {};
            obj.member_id = req.body.memberId;
            obj.transaction_type = 1;
            obj.amount_paid = amountPaid;
            obj.amount_due = amountDue;
            obj.description = req.body.description;
            obj.membership_plan_id = data.membership_plan_id;
            obj.membership_plan_to_member_id = data.membership_plan_to_member_id;
            obj.membership_rate_id = data.rate_to_membership_plan_id;
            obj.membership_rate_to_member_id = data.id;
            obj.date_created = moment().unix();
            saveTransactionToMember(obj, req, res, function(transactionData, err) {
                if(err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                } else {
                    if(transactionData == null) {
                        return logger.logResponse(500, "Error Occured.", "Error Occured", res, req);
                    }
                    updateDueAmountToMember(data.id, amountDue, req, res, function() {
                        transactionData = transactionData.toJSON();
                        return logger.logResponse(200, transactionData, null, res, req);
                    })
                }
            })
        })
    };
    return controller;
}