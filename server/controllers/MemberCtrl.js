var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var async = require('async');
var commonUtils = require("./CommonCtrl.js");
var mailer = require('../lib/Mailer.js');
var readDirFiles = require('read-dir-files');
var config = require('../scripts/config.json');
var memberDAO = require('../dao/MemberDAO.js');
var accountDAO = require('../dao/AccountDAO.js');

module.exports = function (app) {
    var filePath = __dirname;
    var avatarFilePath = filePath.substring(0,filePath.indexOf('server')) + 'web/app/assets/angular/images/avatars/avatar5.png';
    var controller = {};

    controller.getActiveMemberCount = function(req, res, next) {
        var request = {active : true, accountId : req.headers.accountId};
        memberDAO.findAll(request, req, res, function(data, error, req, res) {
            var response = {};
            response.count = data.length;
            return logger.logResponse(200, response, null, res, req);
        });
    };
    
    controller.getMembers = function(req, res, next) {
        var searchFilter = {};
        searchFilter.search = req.query.search;
        searchFilter.active = req.query.active == 'true' ? true : false;
        searchFilter.accountId = req.headers.accountId;
        searchFilter.sortOrder = req.query.sortOrder;
        searchFilter.sortField = req.query.sortField;
        memberDAO.getMembersWithPlanDetails(searchFilter, req, res, function(result, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, result, null, res, req);
        });
    };

    controller.getMemberById = function(req, res, next) {
        memberDAO.getMemberWithDetailById(req.query.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    };

    controller.updateMember = function(req, res, next) {
        var now = moment().unix();
        var obj = {
            first_name : req.body.firstName,
            last_name : req.body.lastName,
            email : req.body.email,
            birthday : moment(req.body.birthdayString, "DD/MM/YYYY HH:mm:ss").valueOf(),
            address : req.body.address,
            city : req.body.city,
            state : req.body.state,
            country : req.body.country,
            pincode : req.body.pincode,
            phone : req.body.phone,
            mobile : req.body.mobile,
            gender : req.body.gender,
            blood_group : req.body.bloodgroup,
            date_of_joining : moment(req.body.joiningDateString, "DD/MM/YYYY HH:mm:ss").valueOf(),
            occupation : req.body.occupation,
            date_modified : now,
            emergencyContactName : req.body.emergencyContactName,
            emergencyContactRelation : req.body.emergencyContactRelation,
            emergencyContactNumber : req.body.emergencyContactNumber,
            status : req.body.status,
            member_type : req.body.memberTypeId,
            profile_pic : req.body.profile_pic,
            group : req.body.groupId,
        }
        memberDAO.update(req.body.id, obj, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        }) 
    }

	controller.addMember = function(req, res, next) {
        accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var memberCreditLeft = parseInt(data.member_credit);
            if(memberCreditLeft > 0) {
                var now = moment().unix();
                var obj = {};
                obj.accountId = req.headers.accountId;
                obj.member_code = commonUtils.getUniqueCode(16);
                obj.first_name = req.body.firstName;
                obj.last_name = req.body.lastName;
                obj.email = req.body.email;
                obj.birthday = moment(req.body.birthdayString, "DD/MM/YYYY HH:mm:ss").valueOf();
                obj.address = req.body.address;
                obj.city = req.body.city;
                obj.state = req.body.state;
                obj.country = req.body.country;
                obj.pincode = req.body.pincode;
                obj.phone = req.body.phone;
                obj.mobile = req.body.mobile;
                obj.gender = req.body.gender;
                obj.blood_group = req.body.bloodgroup;
                obj.date_of_joining = moment(req.body.joiningDateString, "DD/MM/YYYY HH:mm:ss").valueOf();
                obj.active = true;
                obj.occupation = req.body.occupation;
                obj.date_created = now;
                obj.date_modified = now;
                obj.emergencyContactName = req.body.emergencyContactName;
                obj.emergencyContactRelation = req.body.emergencyContactRelation;
                obj.emergencyContactNumber = req.body.emergencyContactNumber;
                obj.status = req.body.status;
                obj.member_type = req.body.memberTypeId;
                obj.profile_pic = req.body.profile_pic;
                obj.group = req.body.groupId;
                schema.model('Member').forge().save(obj).then(function(member) {
                    memeber = member.toJSON();
                    // ----------------Send Email-----------------//
                    var emailData = {};
                    emailData.memberName = memeber.first_name + ' ' + memeber.last_name;
                    emailData.memberId = memeber.id;
                    emailData.mobileNumber = memeber.mobile;
                    emailData.memberAddress = (memeber.address != null ? memeber.address : '');
                    emailData.dob = req.body.birthdayString;
                    emailData.status = memeber.status;
                    emailData.bloodGroup = memeber.blood_group;
                    emailData.memberCode = memeber.member_code;
                    emailData.memberEmergencyContactName = memeber.emergencyContactName;
                    emailData.memberEmergencyContactNumber = memeber.emergencyContactNumber;
                    emailData.memberEmail = memeber.email;
                    emailData.profilePic = memeber.profile_pic != null ? memeber.profile_pic : avatarFilePath;
                    mailer.sendMail('MEMBER_REGISTRATION', emailData, function() {
                        // Handle any case
                    });            
                    // --------------------------------------------//
                    obj = {};
                    obj.member_id = memeber.id;
                    obj.membership_plan_id = req.body.planId;
                    obj.membership_start_date = moment(req.body.joiningDateString, "DD/MM/YYYY  HH:mm:ss").valueOf();
                    obj.membership_end_date = commonUtils.getMembershipEndDate(req.body.membershipPlanType, req.body.joiningDateString).getTime();
                    obj.date_created = now;
                    obj.is_current = true;
                    schema.model('MembershipPlanToMember').forge().save(obj).then(function(membershipPlanToMember) {
                        membershipPlanToMember = membershipPlanToMember.toJSON();
                        getRatePlanByID(req.body.ratePlanId, req.headers.accountId, req, res, function(data, req, res) {
                            if(data == null) {
                                return logger.logResponse(500, "Error Occured. No Data Foumnd for the rate plan.", err, res, req);
                            }
                            data = data.toJSON();
                            obj = {};
                            obj.member_id = memeber.id;
                            obj.membership_plan_to_member_id = membershipPlanToMember.id;
                            obj.membership_plan_id = req.body.planId;
                            obj.rate_to_membership_plan_id = req.body.ratePlanId;
                            obj.amount = data.amount;
                            obj.signup_fee_applied = req.body.isSignUpFee != null && req.body.isSignUpFee != '' && req.body.isSignUpFee == true ? req.body.isSignUpFee : 0;
                            if(obj.signup_fee_applied && obj.signup_fee_applied == 1) {
                                obj.sign_up_fee = data.signup_fee;
                            } else {
                                obj.sign_up_fee = 0;
                            }
                            if(obj.signup_fee_applied == true) {
                                obj.due_amount = parseFloat(data.amount) + parseFloat(data.signup_fee);
                            } else {
                                obj.due_amount = parseFloat(data.amount);
                            }
                            obj.date_created = now;
                            schema.model('MembershipRateToMember').forge().save(obj).then(function(membershipRateToMember) {
                                if(membershipRateToMember != null) {
                                    accountDAO.update(req.headers.accountId, {member_credit : (memberCreditLeft - 1)}, req, res, function(data, error, req, res) {
                                        if(error) {
                                            return logger.logResponse(500, "Error Occured.", error, res, req);
                                        } else {
                                            var resultData = {};
                                            resultData.member = memeber;
                                            resultData.membershipPlanToMember = membershipPlanToMember;
                                            resultData.membershipRateToMember = membershipRateToMember;
                                            return logger.logResponse(200, resultData, null, res, req);
                                        }
                                    });
                                } else {
                                    return logger.logResponse(500, "Error Occured.", "Unknown Error Occured while saving MembershipRateToMember", res, req);
                                }
                            }).catch(function(err) {
                                return logger.logResponse(500, "Error Occured.", err, res, req);
                            })
                        })
                    }).catch(function(err) {
                        return logger.logResponse(500, "Error Occured.", err, res, req);
                    })
                }).catch(function(err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                })
            } else {
                return logger.logResponse(400, "You account dont have enough credits to add new member. Please top up credits to add new member.", "You account dont have enough credits to add new member. Please top up credits to add new member.", res, req);
            }    
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

    controller.deleteMemberById = function(req, res, next) {
        memberDAO.update(req.body.id, {active : false}, req, res, function(response, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            return logger.logResponse(200, "Deleted Successfully.", null, res, req);
        })
    };

    controller.getDocumentByMemberId = function(req, res, next) {
        memberDAO.getDocumentByMemberId(req.headers.accountId, req.query.memberId, req, res, function(data,error,req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    }

	return controller;
}