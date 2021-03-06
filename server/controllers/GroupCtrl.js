var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');
var groupDAO = require('../dao/GroupDAO.js');
var accountDAO = require('../dao/AccountDAO.js');
var memberDAO = require('../dao/MemberDAO.js');

module.exports = function(app) {
    var controller = {};

    controller.getGroups = function(req, res, next) {
        var filter = {};
        filter.accountId = req.headers.accountId;
        filter.sortField = req.query.sortField == null ? 'name' : req.query.sortField;
        filter.sortOrder = req.query.sortOrder == null ? 'ASC' : req.query.sortOrder;
        filter.search = req.query.search;
        filter.pageOffset = req.query.pageOffset;
        filter.pageLimit = req.query.pageLimit;
        groupDAO.findAll(filter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            var response = data;
            groupDAO.countAll(filter, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, error, error, res, req);
                }
                var rowCount = data;
                var responseData = {};
                var rowCount = data;
                responseData.pagination = {page : filter.pageOffset, 'rowCount' : data, pageCount : rowCount%filter.pageLimit == 0 ? parseInt(rowCount/filter.pageLimit) : (parseInt(rowCount/filter.pageLimit))+1};
                responseData.data = response;
                return logger.logResponse(200, responseData, null, res, req);
            })
        })
    };

    controller.assignGroupToMember = function(req, res, next) {
        var data = {};
        data.groupId = req.body.groupId;
        data.memberIds = req.body.memberIds;
        groupDAO.assignGroupToMember(data, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    }

    controller.getGroupById = function(req, res, next) {
        groupDAO.find(req.query.id, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, error, error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        })
    }

    controller.deleteGroupById = function(req, res, next) {
        schema.model('Group').forge().query(function(qb) {
            qb.where({
                accountId: req.body.accountId,
                id: req.body.id
            }).del().then(function(deletedGroup) {
                if (deletedGroup > 0) {
                    memberDAO.removeGroupToMember(req.body.id, req, res, function(data, error, req, res) {
                        if(error) {
                            console.log(error)
                            return logger.logResponse(500, "Error Occured.", error, res, req);
                        }
                        return logger.logResponse(200, {"response" : "Deleted Successfully."}, null, res, req);
                    })                   
                } else {
                    return logger.logResponse(404, "No Record Found.", "No Record Found with given id : "+req.body.id, res, req);
                }    
            }).catch(function(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            })
        })
    }

    controller.addGroup = function(req, res, next) {
        req.body.accountId = req.headers.accountId;
        if(req.body.id != null) {
            groupDAO.update(req.body.id, req.headers.accountId, req.body, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, error, error, res, req);
                }
                return logger.logResponse(200, data, null, res, req);
            })
        } else {
            accountDAO.find(req.headers.accountId, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, "Error Occured.", error, res, req);
                }
                var groupCreditLeft = parseInt(data.group_credit);
                if(groupCreditLeft > 0) {
                    groupDAO.save(req.body, req, res, function(data, error, req, res) {
                        if(error) {
                            return logger.logResponse(500, error, error, res, req);
                        }
                        accountDAO.update(req.headers.accountId, {group_credit : (groupCreditLeft - 1)}, req, res, function(data1, error, req, res) {
                            return logger.logResponse(200, data, null, res, req);
                        });  
                    })  
                } else {
                    return logger.logResponse(400, "You account dont have enough credits to create new Group. Please top up credits to create Groups.", "You account dont have enough credits to create new Groups. Please top up credits to create Groups.", res, req);
                }
            }); 
        }
    }

    return controller;
}