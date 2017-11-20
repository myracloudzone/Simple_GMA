var schema = require('bookshelf').DB;
var async = require('async');
var commonUtils = require("../controllers/CommonCtrl.js");
var moment = require('moment');

module.exports = {
    saveMembershipRateToMember : function(obj, req, res, success) {
        schema.model('MembershipRateToMember').forge().save(obj).then(function(membershipRateToMember) {
            if(membershipRateToMember != null) {
                success(membershipRateToMember.toJSON(), null, req, res)
            } else {
                success(null, "Error Occurred", req, res);
            }
        }).catch(function(err) {
            success(null, err, req, res);
        })
    },
    updateMembershipRateToMemberById : function(id, obj, req, res, success) {
        console.log("Id is "+id)
        schema.model('MembershipRateToMember').forge().where({
            id: id
		}).fetch().then(function (ratePlan) {
			if (ratePlan) {
                ratePlan.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(result != null) {
                        success(result.toJSON(), null, req, res);
                    } else {
                        success(null, "Error Occurred.", req, res);
                    }
                }).catch(function (err) {
                    success(null, err, req, res);
                });
			} else {
				success(null, "Error Occurred.", req, res);
			}
		}).catch(function (err) {
			success(null, err, req, res);
		});
    },

    getMembershipToMemberEntityByMemberId : function(id, req, res, callback) {
        schema.model('MembershipPlanToMember').forge().query( function(qb) {
            qb.leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
            })
            .where('membership_plan_to_member.is_current', true)
            .andWhere('membership_plan_to_member.member_id', id)
            .column('membership_rate_to_member.*', 'membership_plan_to_member.id as membershipPlanToMemberId', 'membership_plan_to_member.membership_start_date', 'membership_plan_to_member.membership_end_date',  'membership_plan_to_member.is_current')
            .debug(true);
        }).fetch().then(function (data) {
            if(data == null) {
                callback(null, "No Record Found.", req, res);    
            }
            callback(data.toJSON(), null, req, res);
        }).catch(function (err) {
            callback(null, err, req, res);
		});
    },
    
    updateMembershipPlanToMemberById : function(id, obj, req, res, success) {
        console.log("Id is "+id)
        schema.model('MembershipPlanToMember').forge().where({
            id: id
		}).fetch().then(function (membershipPlanToMember) {
			if (membershipPlanToMember) {
                membershipPlanToMember.save(obj, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    if(result != null) {
                        success(result.toJSON(), null, req, res);
                    } else {
                        success(null, "Error Occurred.", req, res);
                    }
                }).catch(function (err) {
                    success(null, err, req, res);
                });
			} else {
				success(null, "Error Occurred.", req, res);
			}
		}).catch(function (err) {
			success(null, err, req, res);
		});
    },

    saveTransactionToMember : function(data, req, res, callback) {
        schema.model('MemberPaymentTransaction').forge().save(data).then(function(transaction) {
            callback(transaction, null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    }


}    