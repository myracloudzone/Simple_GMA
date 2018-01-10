var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var config = require('../scripts/config.json');
var commonUtils = require("../controllers/CommonCtrl.js");
var readDirFiles = require('read-dir-files');

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('Member').forge().save(obj).then(function(member) {
            if(member == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(member.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    update : function(id, obj, req, res, callback) {
        schema.model('Member').forge().where({
            id: id
		}).fetch().then(function (member) {
			if (member) {
                member.save(obj, {
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
        schema.model('Member').forge().where({
            id: id
		}).del().then(function (rowsDeleted) {
			callback(rowsDeleted, null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    find : function(id, req, res, callback) {
        schema.model('Member').forge().where({
            id: id
		}).fetch().then(function (result) {
            if(result == null) {
                callback(null, "No Record Found.", req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },
    findAll : function(condition, req, res, callback) {
        condition = JSON.parse(condition);
        schema.model('Member').forge().where(condition)
        .orderBy('id', 'ASC').fetchAll().then(function (result) {
            if(result == null) {
                callback([], null, req, res);
            }
            callback(result.toJSON(), null, req, res);
		}).catch(function (err) {
			callback(null, err, req, res);
		});
    },

    removeGroupToMember : function(groupId, req, res, callback) {
        var query = 'update member m set m.group = null where m.group = '+groupId;
        commonUtils.makeDBRequest(query, function(error, data) {
            callback(data, error, req, res);
        });    
    },

    getMembersWithBirthdayRange : function(searchFilter, req, res, callback) {
        var query = 'SELECT * FROM member WHERE (MONTH(FROM_UNIXTIME(birthday/1000))=MONTH(FROM_UNIXTIME('+searchFilter.date+')) AND DAY(FROM_UNIXTIME(birthday/1000))=DAY(FROM_UNIXTIME('+searchFilter.date+'))) OR (DAY(LAST_DAY(FROM_UNIXTIME(birthday/1000)))=29 AND DAY(FROM_UNIXTIME(birthday/1000))=29 AND DAY(LAST_DAY(FROM_UNIXTIME('+searchFilter.date+')))=28) order by first_name asc';
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                console.log(error);
            }
            if(data == null) {
                callback([], null, req, res);
            }
            var results = [];
            async.mapSeries(data, function (member, cb) {
                var obj = {};
                obj.id = member.id;
                obj.accountId = member.accountId;
                obj.active = member.active;
                obj.birthday = member.birthday;
                obj.birthdayString = moment(parseFloat(member.birthday)).format('DD/MM/YYYY HH:mm:ss');
                obj.dateCreated = member.date_created;
                obj.joiningDate = moment(parseFloat(member.date_of_joining)).format('DD/MM/YYYY HH:mm:ss');
                obj.email = member.email;
                obj.firstName = member.first_name;
                obj.gender = member.gender;
                obj.lastName = member.last_name;
                obj.memberTypeId = member.member_type;
                obj.mobile = member.mobile;
                obj.phone = member.phone;
                obj.typeDisplayName = 'Birthday';
                results.push(obj);
                cb();
            });
            callback(results, null, req, res);
        })
    },

    getMembersWithJoiningAnniversaryRange : function(searchFilter, req, res, callback) {
        var query = 'SELECT * FROM member WHERE (MONTH(FROM_UNIXTIME(date_of_joining/1000))=MONTH(FROM_UNIXTIME('+searchFilter.date+')) AND DAY(FROM_UNIXTIME(date_of_joining/1000))=DAY(FROM_UNIXTIME('+searchFilter.date+'))) OR (DAY(LAST_DAY(FROM_UNIXTIME(date_of_joining/1000)))=29 AND DAY(FROM_UNIXTIME(date_of_joining/1000))=29 AND DAY(LAST_DAY(FROM_UNIXTIME('+searchFilter.date+')))=28) order by first_name asc';
        commonUtils.makeDBRequest(query, function(error, data) {
            if(error) {
                console.log(error);
            }
            if(data == null) {
                callback([], null, req, res);
            }
            var results = [];
            async.mapSeries(data, function (member, cb) {
                var obj = {};
                obj.id = member.id;
                obj.accountId = member.accountId;
                obj.active = member.active;
                obj.birthday = member.birthday;
                obj.birthdayString = moment(parseFloat(member.birthday)).format('DD/MM/YYYY HH:mm:ss');
                obj.dateCreated = member.date_created;
                obj.joiningDate = moment(parseFloat(member.date_of_joining)).format('DD/MM/YYYY HH:mm:ss');
                obj.email = member.email;
                obj.firstName = member.first_name;
                obj.gender = member.gender;
                obj.lastName = member.last_name;
                obj.memberTypeId = member.member_type;
                obj.mobile = member.mobile;
                obj.phone = member.phone;
                obj.typeDisplayName = 'Anniversary';
                results.push(obj);
                cb();
            });
            callback(results, null, req, res);
        })
    },

    getDocumentByMemberId : function(accountId, memberId, req, res, callback) {
        try {
            readDirFiles.list(config.outputFolder + '/' + accountId + '/documents/' + memberId, function (err, filenames) {
                console.log("----------------------")
                if (err)  {
                    callback(null, err, req, res);
                }
                var results = [];
                async.mapSeries(filenames, function(v, cb) {
                    if(!v.endsWith('/')) {
                        var obj = {};
                        obj.fileName = commonUtils.getDocumentName(v);
                        obj.filePath = commonUtils.getDocumentRenderPath(v);
                        obj.actualPath = v;
                        results.push(obj);
                        cb();
                    } else {
                        cb();
                    }
                })
                return callback(results, null, req, res);
              });
        } catch(ex) {
            console.log("-----------------_____-----")
            callback(null, err, req, res);
        }
        
    },

    getMembershipDueMembers : function(searchFilter, req, res, callback) {
        schema.model('MembershipPlanToMember').forge().query( function(qb) {
            qb.innerJoin('member', function() {
                this.on('membership_plan_to_member.member_id', '=', 'member.id')
            })
            .column('member.*', 'membership_plan_to_member.membership_plan_id as planId', 'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate','membership_plan_to_member.is_current as isCurrent')
            .where('member.accountId', searchFilter.accountId)
            .andWhere('member.active', searchFilter.active)
            .andWhere('membership_plan_to_member.is_current', true)
            .andWhere('membership_plan_to_member.membership_end_date', '<', searchFilter.searchDate)
            .orderBy('membership_plan_to_member.membership_end_date' , 'asc')
            .debug(true);
        }).fetchAll().then(function (membersData) {
            if(membersData == null) {
                callback([], null, req, res);
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
                obj.planId = member.planId;
                obj.state = member.state;
                obj.country = member.country;
                obj.status = member.status;
                obj.profile_pic = member.profile_pic;
                obj.membershipStartDate = member.membershipStartDate;
                obj.membershipEndDate = member.membershipEndDate;
                obj.ratePlanId = member.membershipRatePlanId;
                results.push(obj);
                cb();
            });
            callback(results, null, req, res);
        }).catch(function (err) {
            callback(null, err, req, res);
        });
    },

    getMembersWithPlanDetails : function(searchFilter, req, res, callback) {
        if(searchFilter.search == null || searchFilter.search == '') {
            console.log(searchFilter)
            schema.model('Member').forge().query( function(qb) {
                qb.leftJoin('membership_plan_to_member', function() {
                    this.on('membership_plan_to_member.member_id', '=', 'member.id')
                }).leftJoin('membership_rate_to_member', function() {
                    this.on('membership_rate_to_member.member_id', '=', 'member.id').on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
                }).leftJoin('membership_plan', function() {
                    this.on('membership_plan.id', '=', 'membership_rate_to_member.membership_plan_id')
                }).leftJoin('group', function() {
                    this.on('group.id', '=', 'member.group')
                })
                .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
                'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate','membership_plan_to_member.is_current as isCurrent', 'membership_plan.name as membershipPlanName', 'group.name as groupName')
                .where('member.accountId', searchFilter.accountId)
                .andWhere('member.active', searchFilter.active)
                .andWhere('membership_plan_to_member.is_current', true)
                .orderBy((searchFilter.sortField != null ? searchFilter.sortField : 'first_name'), (searchFilter.sortOrder != null) ? searchFilter.sortOrder : 'asc')
                .debug(true);
            }).fetchPage(commonUtils.getQueryObject(req)).then(function (membersData) {
                if(membersData == null) {
                    callback([], null, req, res);
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
                    obj.memberCode = member.member_code;
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
                    obj.groupName = member.groupName;
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
                    obj.membershipPlanName = member.membershipPlanName;
                    results.push(obj);
                    cb();
                });
                callback({data : results, pagination : membersData.pagination}, null, req, res);
            }).catch(function (err) {
                callback(null, err, req, res);
            });
        } else {
            var likeSearchTerm = '%' + searchFilter.search + '%';
            schema.model('Member').forge().query( function(qb) {
                qb.leftJoin('membership_plan_to_member', function() {
                    this.on('membership_plan_to_member.member_id', '=', 'member.id')
                }).leftJoin('membership_rate_to_member', function() {
                    this.on('membership_rate_to_member.member_id', '=', 'member.id').on('membership_rate_to_member.membership_plan_to_member_id', '=', 'membership_plan_to_member.id')
                })
                .where('member.accountId', searchFilter.accountId)
                .andWhere('member.active', searchFilter.active)
                .andWhereRaw('concat_ws(" ",member.first_name,member.last_name) like ? OR member.id = ?', [likeSearchTerm, searchFilter.search])
                .andWhere('membership_plan_to_member.is_current', true)
                .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
                'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate' ,'membership_plan_to_member.is_current as isCurrent')
                .orderBy('member.'+ (searchFilter.sortField != null ? searchFilter.sortField : 'first_name'), (searchFilter.sortOrder != null) ? searchFilter.sortOrder : 'asc')
                .debug(true);
            }).fetchPage(commonUtils.getQueryObject(req)).then(function (membersData) {
                if(membersData == null) {
                    callback([], null, req, res);
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
                callback({data : results, pagination : membersData.pagination}, null, req, res);
            }).catch(function (err) {
                callback(null, err, req, res);
            }); 
        }
    },

    getMemberWithDetailById : function(id, req, res, callback) {
        schema.model('Member').forge().query( function(qb) {
            qb.leftJoin('membership_plan_to_member', function() {
                this.on('membership_plan_to_member.member_id', '=', 'member.id')
            }).leftJoin('membership_rate_to_member', function() {
                this.on('membership_rate_to_member.member_id', '=', 'member.id')
            })
            .where('member.accountId', req.headers.accountId)
            .andWhere('member.id', id)
            .column('member.*', 'membership_rate_to_member.id as membershipRateToMemberId', 'membership_rate_to_member.membership_plan_id as membershipPlanId', 'membership_rate_to_member.rate_to_membership_plan_id as membershipRatePlanId', 'membership_rate_to_member.amount as amount',  'membership_rate_to_member.signup_fee_applied as isSignUpFeeApplied', 'membership_rate_to_member.sign_up_fee as signUpFee', 'membership_rate_to_member.due_amount as dueAmount',
            'membership_plan_to_member.id as membershipPlanToMemberId','membership_plan_to_member.membership_start_date as membershipStartDate','membership_plan_to_member.membership_end_date as membershipEndDate' )
            .debug(true);
		}).fetch().then(function (memberData) {
            if(memberData == null) {
                callback({}, null, req, res);
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
            callback(obj, null, req, res);
		}).catch(function (err) {
            callback(null, err, req, res);
		});
    },

    getMembersCountByMonth : function(searchFilter, req, res, callback) {
        schema.model('Member').forge().query( function(qb) {
            qb.where('member.accountId', searchFilter.accountId)
            .andWhere('member.active', searchFilter.active)
            .andWhere('member.date_created', '>=', searchFilter.date)
            .debug(true);
		}).fetchAll().then(function (membersData) {
            if(membersData == null) {
                callback([], null, req, res);
            }
            var members = membersData.toJSON();
            var memberCountMapping = {};
            var uniqueDates = [];
            async.mapSeries(members, function (member, cb) {
                date = moment(parseFloat(member.date_created)*1000).format('MMM YYYY');
                if(uniqueDates.indexOf(date) < 0) {
                    uniqueDates.push(date);
                    memberCountMapping[date] = 1;
                } else {
                    var lastCount = parseInt(memberCountMapping[date]);
                    memberCountMapping[date] = lastCount + 1;
                }
                cb();
            });
            callback(memberCountMapping, null, req, res);
		}).catch(function (err) {
            callback(null, err, req, res);
		});
    }
}