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

module.exports = function (app) {
    var filePath = __dirname;
    var avatarFilePath = filePath.substring(0,filePath.indexOf('server')) + 'web/app/assets/angular/images/avatars/avatar5.png';
    var controller = {};
    
    controller.getMembers = function(req, res, next) {
        if(req.query.search == null || req.query.search == '') {
            schema.model('Member').forge().query( function(qb) {
                qb.leftJoin('membership_plan_to_member', function() {
                    this.on('membership_plan_to_member.member_id', '=', 'member.id')
                }).leftJoin('membership_rate_to_member', function() {
                    this.on('membership_rate_to_member.member_id', '=', 'member.id').on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
                })
                .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
                'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate','membership_plan_to_member.is_current as isCurrent')
                .where('member.accountId', req.headers.accountId)
                .andWhere('member.active', true)
                .andWhere('membership_plan_to_member.is_current', true)
                .orderBy('member.first_name', 'asc')
                .debug(true);
            }).fetchPage(commonUtils.getQueryObject(req)).then(function (membersData) {
                if(membersData == null) {
                    return logger.logResponse(200, [], null, res, req);
                }
                var members = membersData.toJSON();
                var results = [];
                async.mapSeries(members, function (member, cb) {
                    var obj = {};
                    obj.id = member.id;
                    obj.accountId = member.accountId;
                    obj.active = member.active;
                    obj.address = member.address;
                    obj.birthday = member.birthday;
                    obj.birthdayString = moment(parseFloat(member.birthday)).format('DD/MM/YYYY HH:mm:ss');
                    obj.bloodgroup = member.blood_group;
                    obj.city = member.city;
                    obj.dateCreated = member.date_created;
                    obj.joiningDate = moment(parseFloat(member.date_of_joining)).format('DD/MM/YYYY HH:mm:ss');
                    obj.email = member.email;
                    obj.emergencyContactName = member.emergencyContactName;
                    obj.emergencyContactNumber = member.emergencyContactNumber;
                    obj.emergencyContactRelation = member.emergencyContactRelation;
                    obj.firstName = member.first_name;
                    obj.gender = member.gender;
                    obj.groupId = member.group;
                    obj.lastName = member.last_name;
                    obj.memberTypeId = member.member_type;
                    obj.mobile = member.mobile;
                    obj.occupation = member.occupation;
                    obj.phone = member.phone;
                    obj.pincode = member.pincode;
                    obj.state = member.state;
                    obj.country = member.country;
                    obj.status = member.status;
                    obj.profile_pic = member.profile_pic;
                    obj.membershipStartDate = member.membershipStartDate;
                    obj.membershipEndDate = member.membershipEndDate;
                    obj.ratePlanId = member.membershipRatePlanId;
                    obj.planId = member.membershipPlanId;
                    results.push(obj);
                    cb();
                });
                return logger.logResponse(200, {data : results, pagination : membersData.pagination}, null, res, req);
            }).catch(function (err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            });
        } else {
            var likeSearchTerm = '%' + req.query.search + '%';
            schema.model('Member').forge().query( function(qb) {
                qb.leftJoin('membership_plan_to_member', function() {
                    this.on('membership_plan_to_member.member_id', '=', 'member.id')
                }).leftJoin('membership_rate_to_member', function() {
                    this.on('membership_rate_to_member.member_id', '=', 'member.id').on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
                })
                .where('member.accountId', req.headers.accountId)
                .andWhere('member.active', true)
                .andWhereRaw('concat_ws(" ",member.first_name,member.last_name) like ? OR member.id = ?', [likeSearchTerm, req.query.search])
                .andWhere('membership_plan_to_member.is_current', true)
                .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
                'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate' ,'membership_plan_to_member.is_current as isCurrent')
                .orderBy('member.first_name', 'asc')
                .debug(true);
            }).fetchPage(commonUtils.getQueryObject(req)).then(function (membersData) {
                if(membersData == null) {
                    return logger.logResponse(200, [], null, res, req);
                }
                var members = membersData.toJSON();
                var results = [];
                async.mapSeries(members, function (member, cb) {
                    var obj = {};
                    obj.id = member.id;
                    obj.accountId = member.accountId;
                    obj.active = member.active;
                    obj.address = member.address;
                    obj.birthday = member.birthday;
                    obj.country = member.country;
                    obj.birthdayString = moment(parseFloat(member.birthday)).format('DD/MM/YYYY HH:mm:ss');
                    obj.bloodgroup = member.blood_group;
                    obj.city = member.city;
                    obj.dateCreated = member.date_created;
                    obj.joiningDate = moment(parseFloat(member.date_of_joining)).format('DD/MM/YYYY HH:mm:ss');
                    obj.email = member.email;
                    obj.emergencyContactName = member.emergencyContactName;
                    obj.emergencyContactNumber = member.emergencyContactNumber;
                    obj.emergencyContactRelation = member.emergencyContactRelation;
                    obj.firstName = member.first_name;
                    obj.gender = member.gender;
                    obj.groupId = member.group;
                    obj.lastName = member.last_name;
                    obj.memberTypeId = member.member_type;
                    obj.mobile = member.mobile;
                    obj.occupation = member.occupation;
                    obj.phone = member.phone;
                    obj.pincode = member.pincode;
                    obj.state = member.state;
                    obj.status = member.status;
                    obj.profile_pic = member.profile_pic;
                    obj.membershipStartDate = member.membershipStartDate;
                    obj.membershipEndDate = member.membershipEndDate;
                    obj.ratePlanId = member.membershipRatePlanId;
                    obj.planId = member.membershipPlanId;
                    results.push(obj);
                    cb();
                });
                return logger.logResponse(200, {data : results, pagination : membersData.pagination}, null, res, req);
            }).catch(function (err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            });
        }
        
    };

    controller.getMemberById = function(req, res, next) {
        schema.model('Member').forge().query( function(qb) {
            qb.leftJoin('membership_plan_to_member', function() {
                this.on('membership_plan_to_member.member_id', '=', 'member.id')
            }).leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.member_id', '=', 'member.id')
            })
            .where('member.accountId', req.headers.accountId)
            .andWhere('member.active', true)
            .andWhere('member.id', req.query.id)
            .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
            'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate' )
            .orderBy('member.first_name', 'asc')
            .debug(true);
		}).fetch().then(function (memberData) {
            if(memberData == null) {
                return logger.logResponse(200, {}, null, res, req);
            }
            var member = memberData.toJSON();
            var obj = {};
            obj.id = member.id;
            obj.accountId = member.accountId;
            obj.active = member.active;
            obj.address = member.address;
            obj.country = member.country;
            obj.birthday = member.birthday;
            obj.birthdayString = moment(parseFloat(member.birthday)).format('YYYY-MM-DD HH:mm:ss');
            obj.bloodgroup = member.blood_group;
            obj.city = member.city;
            obj.dateCreated = member.date_created;
            obj.memberCode = member.member_code;
            obj.joiningDateString = moment(parseFloat(member.date_of_joining)).format('YYYY-MM-DD HH:mm:ss');
            obj.email = member.email;
            obj.emergencyContactName = member.emergencyContactName;
            obj.emergencyContactNumber = member.emergencyContactNumber;
            obj.emergencyContactRelation = member.emergencyContactRelation;
            obj.firstName = member.first_name;
            obj.gender = member.gender;
            obj.groupId = member.group;
            obj.lastName = member.last_name;
            obj.memberTypeId = member.member_type;
            obj.mobile = member.mobile;
            obj.occupation = member.occupation;
            obj.phone = member.phone;
            obj.pincode = member.pincode;
            obj.state = member.state;
            obj.status = member.status;
            obj.profile_pic = member.profile_pic;
            obj.membershipStartDate = member.membershipStartDate;
            obj.membershipEndDate = member.membershipEndDate;
            obj.ratePlanId = member.membershipRatePlanId;
            obj.planId = member.membershipPlanId;
            obj.membershipRateToMemberId = member.membershipRateToMemberId;
            obj.membershipPlanToMemberId = member.membershipPlanToMemberId;
            return logger.logResponse(200, obj, null, res, req);
		}).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
		});
    };

    controller.updateMember = function(req, res, next) {
        console.log(req.body.joiningDateString);
        console.log(moment(req.body.joiningDateString, "DD/MM/YYYY HH:mm:ss").valueOf());
        var now = moment().unix();
        schema.model('Member').forge().where({
            id: req.body.id,
            accountId : req.headers.accountId
        }).fetch().then(function (obj) {
            if (obj) {
                obj.save({
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
                }, {
                    method: 'update',
                    patch: true,
                    require: false
                }).then(function (result) {
                    return logger.logResponse(200, result.toJSON(), null, res, req);
                }).catch(function (err) {
                    return logger.logResponse(500, "Error Occured.", err, res, req);
                });
            } else {
                return logger.logResponse(404, "No Record Found.", "No Record Found with given id : "+req.body.id, res, req);
            }
        }).catch(function (err) {
            return logger.logResponse(500, "Error Occured.", err, res, req);
        });
    }

	controller.addMember = function(req, res, next) {
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
            mailer.sendMail('MEMBER_REGISTRATION', emailData);            
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
                    obj.signup_fee_applied = req.body.isSignUpFee != null && req.body.isSignUpFee != '' ? req.body.isSignUpFee : 1;
                    if(obj.signup_fee_applied && obj.signup_fee_applied == 1) {
                        obj.sign_up_fee = data.signup_fee;
                    } else {
                        obj.sign_up_fee = 0;
                    }
                    obj.due_amount = data.amount;
                    obj.date_created = now;
                    schema.model('MembershipRateToMember').forge().save(obj).then(function(membershipRateToMember) {
                        if(membershipRateToMember != null) {
                            var resultData = {};
                            resultData.member = memeber;
                            resultData.membershipPlanToMember = membershipPlanToMember;
                            resultData.membershipRateToMember = membershipRateToMember;
                            return logger.logResponse(200, resultData, null, res, req);
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
        schema.model('Member').forge().where({
            id: req.body.id,
            accountId : req.headers.accountId
		}).fetch().then(function (member) {
			if (member) {
                member.save({
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

    function getDocumentName(path) {
        var index = path.indexOf('_____');
        var name = path.substring((index+5), path.length);
        return name;
    }
    function getDocumentRenderPath(path) {
        var renderPath = path.substring(config.outputFolder.length, path.length);
        return '/media' + renderPath;
    }

    controller.getDocumentByMemberId = function(req, res, next) {
        readDirFiles.list(config.outputFolder + '/' + req.headers.accountId + '/documents/' + req.query.memberId, function (err, filenames) {
            if (err)  {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            }
            var results = [];
            async.mapSeries(filenames, function(v, cb) {
                if(!v.endsWith('/')) {
                    var obj = {};
                    obj.fileName = getDocumentName(v);
                    obj.filePath = getDocumentRenderPath(v);
                    obj.actualPath = v;
                    results.push(obj);
                    cb();
                } else {
                    cb();
                }
            })
            return logger.logResponse(200, results, null, res, req);
          });
    }

	return controller;
}