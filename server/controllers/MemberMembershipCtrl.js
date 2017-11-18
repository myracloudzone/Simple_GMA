var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var membershipDAO = require('../dao/MembershipDAO.js');
var commonUtils = require("./CommonCtrl.js");


module.exports = function(app) {
    var controller = {};


    function getMembershipToMemberEntityById(id, req, res, callback) {
        schema.model('MembershipPlanToMember').forge().query( function(qb) {
            qb.leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
            })
            .where('membership_plan_to_member.is_current', true)
            .andWhere('membership_plan_to_member.member_id', id)
            .column('membership_rate_to_member.*', 'membership_plan_to_member.id as membershipPlanToMemberId', 'membership_plan_to_member.membership_start_date', 'membership_plan_to_member.membership_end_date',  'membership_plan_to_member.is_current')
            .debug(true);
        }).fetch().then(function (data) {
            callback(data, null);
        }).catch(function (err) {
            callback(null, err);
		});
    }

    function checkForMembershipUpdate(id, req, res, callback) {
        schema.model('MembershipPlanToMember').forge().query( function(qb) {
            qb.leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
            })
            .where('membership_plan_to_member.is_current', true)
            .andWhere('membership_plan_to_member.member_id', id)
            .column('membership_plan_to_member.id', 'membership_plan_to_member.membership_plan_id', 'membership_plan_to_member.membership_start_date',
            'membership_plan_to_member.membership_end_date','membership_plan_to_member.is_current', 'membership_rate_to_member.amount'
            , 'membership_rate_to_member.due_amount')
            .debug(true);
        }).fetch().then(function (data) {
            if(data == null) {
                callback(null, 'No membership Found.', err);
            }
            data = data.toJSON();
            schema.model('MemberPaymentTransaction').forge().query( function(qb) {
                qb.where('member_payment_transaction.transaction_type', 1)
                .andWhere('member_payment_transaction.member_id', id)
                .debug(true);
            }).fetch().then(function (paymentHistory) {
                var membershipStartDate = parseFloat(data.membership_start_date);
                var membershipEndDate = parseFloat(data.membership_end_date);
                var dateRangeBeforeMembershipEndDate = moment(membershipEndDate).subtract(15, 'days');
                var dateRangeAfterMembershipStartDate = moment(membershipStartDate).add(15, 'days');
                var now = moment().unix() * 1000;
                if (now >= membershipStartDate && now <= dateRangeAfterMembershipStartDate ) {
                    callback(true, 'Allowed', null);
                } else if ((now >= dateRangeBeforeMembershipEndDate && now <= membershipEndDate)) {
                    var dueAmount = parseFloat(data.due_amount);
                    if(dueAmount > 0) {
                        callback(false, 'There is due amount with current Membership. Please deposit the remaining amount to update the Membership.', null);
                    } else {
                        callback(true, 'Allowed to change.', null);
                    }
                } else if(now > membershipEndDate) {
                    var dueAmount = parseFloat(data.due_amount);
                    if(dueAmount > 0) {
                        callback(false, 'There is due amount with current Membership. Please deposit the remaining amount to update the Membership.', null);
                    } else {
                        callback(true, 'Allowed to change.', null);
                    }
                } else if(now <= membershipStartDate) {
                    callback(true, 'Allowed to change.', null);
                } else {
                    callback(false, 'Membership not allowed to be change after 15 days of registration.', null);
                }
            }).catch(function (err) {
                callback(null,'Error Occured', err);
            });
        }).catch(function (err) {
            callback(null,'Error Occured', err);
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

    controller.isMembershipUpgradeAllowed = function(req, res, next) {
        checkForMembershipUpdate(req.query.memberId, req, res, function(allowed, msg, err) {
            var response = {isAllowed : allowed, message : msg, error : err};
            return logger.logResponse(200, response, null, res, req);
        })
    };

    function getPlanById (planId, req, res, callback) {
        req.query.accountId = req.headers.accountId; // Need to be updated.
        schema.model('MembershipPlan').forge().query( function(qb) {
            qb.leftJoin('rates_to_membership_plan', function() {
                this.on('rates_to_membership_plan.membership_plan_id', '=', 'membership_plan.id')
            })
            .where('membership_plan.id', planId)
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
			callback(result, null);
		}).catch(function (err) {
            callback(null, err);
		});
    }

    function getRatePlanByID(id, accountId, req, res, callback) {
        schema.model('RatesToMembershipPlan').forge()
            .where({
                id: id,
                accountId : accountId
            })
            .fetch().then(function(result) {
                callback(result,req, res);
            }).catch(function(err) {
                console.log(err)
            })
    }

    controller.updateMembershipOfMember = function(req, res, next) {
        checkForMembershipUpdate(req.body.memberId, req, res, function(allowed, msg, err) {
            if(!allowed) {
                return logger.logResponse(500, msg, err, res, req);
            }
            getMembershipToMemberEntityById(req.body.memberId, req, res, function(data, err) {
                if(err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                }
                if(data == null) {
                    return logger.logResponse(404, "No Membership Found.", "No Membership Found.", res, req);
                }
                data = data.toJSON();
                var oldMembershipData = data;
                var membershipPlanToMemberId = data.membershipPlanToMemberId;
                var membershipRateToMemberId = data.id;
                var membershipPlanId = data.membership_plan_id;
                if(membershipPlanId == req.body.planId) {
                    return logger.logResponse(400, "Different Plan is required to chnage the Membership Plan.", "Different plan is required to chnage the Membership Plan.", res, req);
                }
                getPlanById(membershipPlanId, req, res, function(plan, err) {
                    if(err) {
                        return logger.logResponse(500, "Error Occured.", err, res, req);
                    }
                    if(plan == null) {
                        return logger.logResponse(404, "No Plan Found.", "No Plan Found.", res, req);
                    }
                    var plan = plan;
                    // Check for Upgrade//Downgrade
                    var upgrade = true;
                    var membershipStartDate = parseFloat(data.membership_start_date);
                    var membershipEndDate = parseFloat(data.membership_end_date);
                    var dateRangeBeforeMembershipEndDate = moment(membershipEndDate).subtract(15, 'days');
                    var dateRangeAfterMembershipStartDate = moment(membershipStartDate).add(15, 'days');
                    var now = moment().unix() * 1000;
                    if (now >= membershipStartDate && now <= dateRangeAfterMembershipStartDate ) {
                        upgrade = false;
                    } else if ((now >= dateRangeBeforeMembershipEndDate && now <= membershipEndDate)) {
                        upgrade = true;
                    } else if(now > membershipEndDate) {
                       upgrade = true;
                    } else if(now < membershipStartDate) {
                        upgrade = false;
                    }
                    var m_start_date = null;
                    var m_end_date = null;
                    console.log(data)
                    console.log("------------------------------------------------------------------")
                    console.log(membershipEndDate);
                    console.log(moment(membershipEndDate).format('DD/MM/YYYY  HH:mm:ss'));
                    if(upgrade) {
                        m_start_date = membershipEndDate;
                        m_end_date = commonUtils.getMembershipEndDate(req.body.membershipPlanType, moment(membershipEndDate).format('DD/MM/YYYY  HH:mm:ss')).getTime();
                    } else {
                        m_start_date = membershipStartDate;
                        m_end_date = commonUtils.getMembershipEndDate(req.body.membershipPlanType, moment(membershipStartDate).format('DD/MM/YYYY  HH:mm:ss')).getTime();
                    }
                    // -----------------------
                    var obj = {};
                    obj.member_id = req.body.memberId;
                    obj.membership_plan_id = req.body.planId;
                    obj.membership_start_date = m_start_date
                    obj.membership_end_date = m_end_date
                    obj.date_created = now/1000;
                    obj.is_current = true;
                    schema.model('MembershipPlanToMember').forge().save(obj).then(function(membershipPlanToMember) {
                        var membershipPlanToMember = membershipPlanToMember.toJSON();
                        getRatePlanByID(req.body.ratePlanId, req.headers.accountId, req, res, function(ratePlan, req, res) {
                            if(ratePlan == null) {
                                return logger.logResponse(500, "Error Occured. No Data Found for the rate plan.", "Error Occured. No Data Found for the rate plan.", res, req);
                            }
                            ratePlan = ratePlan.toJSON();
                            obj = {};
                            obj.member_id = req.body.memberId;
                            obj.membership_plan_to_member_id = membershipPlanToMember.id;
                            obj.membership_plan_id = req.body.planId;
                            obj.rate_to_membership_plan_id = req.body.ratePlanId;
                            obj.amount = ratePlan.amount;
                            
                            obj.signup_fee_applied = req.body.isSignUpFee == null ? false : req.body.isSignUpFee;
                            console.log("------------"+req.body.isSignUpFee)
                            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            console.log("------------"+obj.signup_fee_applied)
                            if(!upgrade) {
                                if(parseFloat(ratePlan.amount) < parseFloat(data.amount)) {
                                    if(data.signup_fee_applied) {
                                        obj.due_amount = parseFloat(ratePlan.amount) - (parseFloat(data.amount) + parseFloat(data.sign_up_fee) - parseFloat(data.due_amount));
                                    } else {
                                        obj.due_amount = parseFloat(ratePlan.amount) - (parseFloat(data.amount) - parseFloat(data.due_amount));
                                    }
                                } else {
                                    if(data.signup_fee_applied) {
                                        obj.due_amount = parseFloat(ratePlan.amount) - (parseFloat(data.amount) + parseFloat(data.sign_up_fee) - parseFloat(data.due_amount));
                                    } else {
                                        obj.due_amount = parseFloat(ratePlan.amount) - (parseFloat(data.amount) - parseFloat(data.due_amount));
                                    }
                                }
                            } else {
                                obj.due_amount = parseFloat(ratePlan.amount);
                            }
                            
                            if(obj.signup_fee_applied && obj.signup_fee_applied == 1) {
                                obj.sign_up_fee = ratePlan.signup_fee;
                                obj.due_amount =  obj.due_amount + parseFloat(obj.sign_up_fee);
                            } else {
                                obj.sign_up_fee = 0;
                            }
                            obj.date_created = now/1000;
                            membershipDAO.saveMembershipRateToMember(obj, req, res , function(data, error, req, res) {
                                var newMembershipRatePlan = data;
                                if(error) {
                                   
                                }
                                obj = {is_current : false};
                                membershipDAO.updateMembershipPlanToMemberById(membershipPlanToMemberId, obj, req, res, function(data, error, req, res) {
                                    if(error) {
                                        console.log("--------------5---------------------")
                                        console.log(error)
                                    }
                                    obj = {};
                                    obj.member_id = req.body.memberId;
                                    obj.transaction_type = 3;   //1 for payment 2 for refund - 3 Membership Change Adjustment 
                                    obj.amount_paid = oldMembershipData.due_amount;
                                    obj.amount_due = 0;
                                    obj.description = "Membership Change/Amount Adjust";
                                    obj.membership_plan_id = oldMembershipData.membership_plan_id;
                                    obj.membership_plan_to_member_id = oldMembershipData.membership_plan_to_member_id;
                                    obj.membership_rate_id = oldMembershipData.rate_to_membership_plan_id;
                                    obj.membership_rate_to_member_id = oldMembershipData.id;
                                    obj.date_created = moment().valueOf();
                                    obj.amount = oldMembershipData.due_amount;
                                    saveTransactionToMember(obj, req, res, function(transactionData, err) {
                                        if(err) {
                                            return logger.logResponse(500, "Error Occured.", err, res, req);
                                        } else {
                                            if(transactionData == null) {
                                                return logger.logResponse(500, "Error Occured.", "Error Occured", res, req);
                                            }
                                            var newTotalAmount = req.body.isSignUpFee == null ? parseFloat(ratePlan.amount) : parseFloat(ratePlan.amount) + parseFloat(ratePlan.signup_fee);
                                            obj = {};
                                            obj.member_id = req.body.memberId;
                                            obj.transaction_type = 3;   //1 for payment 2 for refund - 3 Membership Change Adjustment 
                                            obj.amount_paid = newTotalAmount - newMembershipRatePlan.due_amount;
                                            obj.amount_due = newMembershipRatePlan.due_amount;
                                            obj.description = "Membership Change/Amount";
                                            obj.membership_plan_id = newMembershipRatePlan.membership_plan_id;
                                            obj.membership_plan_to_member_id = newMembershipRatePlan.membership_plan_to_member_id;
                                            obj.membership_rate_id = newMembershipRatePlan.rate_to_membership_plan_id;
                                            obj.membership_rate_to_member_id = newMembershipRatePlan.id;
                                            obj.date_created = moment().valueOf();
                                            obj.amount = newTotalAmount;
                                            saveTransactionToMember(obj, req, res, function(transactionData, err) {
                                                if(err) {
                                                    return logger.logResponse(500, "Error Occured.", err, res, req);
                                                } else {
                                                    if(transactionData == null) {
                                                        return logger.logResponse(500, "Error Occured.", "Error Occured", res, req);
                                                    }
                                                    var responseObject = {};
                                                    responseObject.message = "Successfully Updated.";
                                                    responseObject.amount = newMembershipRatePlan.due_amount;
                                                    responseObject.actionStatus = newMembershipRatePlan.due_amount < 0 ? 101 : 100;
                                                    if(responseObject.actionStatus == 101) {
                                                        responseObject.actionStatusMessage = 'There is a extra amount of '+ (-1 * responseObject.amount) + ' which can be refunded. Do you want to refund it?';
                                                    }
                                                    return logger.logResponse(200, responseObject, null, res, req);
                                                }
                                            })
                                        }
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
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

    controller.refundAmount = function(req, res, next) {
        membershipDAO.getMembershipToMemberEntityByMemberId(req.body.memberId, req, res, function(response, error, req, res) {
            if(error) {
                return logger.logResponse(500, null, error, res, req);
            }
            if(response.due_amount < 0) {
                membershipDAO.updateMembershipRateToMemberById(response.id, {due_amount : 0}, req, res, function(response1, error, req, res) {
                    if(error) {
                        return logger.logResponse(500, null, error, res, req);
                    }
                    var obj = {};
                    obj.member_id = req.body.memberId;
                    obj.transaction_type = 2;   //1 for payment 2 for refund
                    obj.amount_paid = response.due_amount;
                    obj.amount_due = 0;
                    obj.description = "Refund Done";
                    obj.membership_plan_id = response.membership_plan_id;
                    obj.membership_plan_to_member_id = response.membership_plan_to_member_id;
                    obj.membership_rate_id = response.rate_to_membership_plan_id;
                    obj.membership_rate_to_member_id = response.id;
                    obj.date_created = moment().valueOf();
                    obj.amount = response.due_amount;
                    saveTransactionToMember(obj, req, res, function(transactionData, err) {
                        if(err) {
                            return logger.logResponse(500, "Error Occured.", err, res, req);
                        } else {
                            if(transactionData == null) {
                                return logger.logResponse(500, "Error Occured.", "Error Occured", res, req);
                            }
                            return logger.logResponse(200, {statusCode : 200, message : "Updated Succesfully."}, null, res, req);            
                        }
                    })
                })
            } else {
                return logger.logResponse(404, "Not Able to refund the amount. No amount found to refund.", "Not Able to refund the amount. No amount found to refund.", res, req);
            }
        }) 
    }

    controller.getMemberTransactionHistory = function(req, res, next) {
        var transaction_type = req.query.transactionType != null ? req.query.transactionType : [1,2,3];
        schema.model('MemberPaymentTransaction').query( function(qb) {
            qb.where('member_payment_transaction.member_id', req.query.memberId)
            .andWhereRaw('member_payment_transaction.transaction_type in (?)', [transaction_type])
            .orderBy('member_payment_transaction.date_created', 'DESC')
            .debug(true);
		}).fetchAll().then(function (transactionHistory) {
			if(transactionHistory == null) {
                return logger.logResponse(200, [], null, res, req);
            } else {
                transactionHistory = transactionHistory.toJSON();
                var results = [];
                async.mapSeries(transactionHistory, function (history, cb) {
                    var obj = {};
                    obj.id = history.id;
                    obj.memberId = history.member_id;
                    obj.amount = history.amount;
                    obj.transactionType = history.transaction_type;
                    obj.amountPaid = history.amount_paid;
                    obj.amountDue = history.amount_due;
                    obj.description = history.description;
                    obj.dateCreated = parseInt(history.date_created);
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
            obj.transaction_type = 1;   //1 for payment 2 for refund
            obj.amount_paid = amountPaid;
            obj.amount_due = amountDue;
            obj.description = req.body.description;
            obj.membership_plan_id = data.membership_plan_id;
            obj.membership_plan_to_member_id = data.membership_plan_to_member_id;
            obj.membership_rate_id = data.rate_to_membership_plan_id;
            obj.membership_rate_to_member_id = data.id;
            obj.date_created = moment().valueOf();
            obj.amount = originalAmountDue;
            console.log(obj)
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