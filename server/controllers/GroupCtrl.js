var schema = require('bookshelf').DB;
var logger = require('../scripts/logger.js');

module.exports = function(app) {
    var controller = {};

    controller.getGroups = function(req, res, next) {
        schema.model('Group').forge()
            .where({
                accountId: req.headers.accountId
            })
            .fetchAll().then(function(results) {
                if (results == null) {
                    return logger.logResponse(404, "No Record Found.", "No Record Found with given id : "+req.body.id, res, req);
                } else {
                    results = results.toJSON();
                    return logger.logResponse(200, results, null, res, req);
                }
            }).catch(function(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            })
    }

    controller.getGroupById = function(req, res, next) {
        schema.model('Group').forge()
            .where({
                id: req.query.id
            })
            .fetch().then(function(result) {
                if (result == null) {
                    return logger.logResponse(404, "No Record Found.", "No Record Found with given id : "+req.body.id, res, req);
                } else {
                    result = result.toJSON();
                    return logger.logResponse(200, result, null, res, req);
                }
            }).catch(function(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            })
    }

    controller.deleteGroupById = function(req, res, next) {
        schema.model('Group').forge().query(function(qb) {
            qb.where({
                accountId: req.body.accountId,
                id: req.body.id
            }).del().then(function(deletedGroup) {
                if (deletedGroup > 0) {
                    return logger.logResponse(200, {"response" : "Deleted Successfully."}, null, res, req);
                } else {
                    return logger.logResponse(404, "No Record Found.", "No Record Found with given id : "+req.body.id, res, req);
                }    
            }).catch(function(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            })
        })
    }

    controller.addGroup = function(req, res, next) {
        req.body.accountId = 1; // Need to be updated.
        if(req.body.id != null) {
            schema.model('Group').forge().where({
                id: req.body.id,
                accountId : req.body.accountId
            }).fetch().then(function (group) {
                if (group) {
                    group.save({
                        description : req.body.description,
                        icon_url : req.body.icon_url,
                        name : req.body.name
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
        } else {
            schema.model('Group').forge().save(req.body).then(function(group) {
                if (group) {
                    return logger.logResponse(200, group.toJSON(), null, res, req);
                } else {
                   return logger.logResponse(404, {}, "Not able to create new group.", res, req);
                }
            }).catch(function(err) {
                return logger.logResponse(500, "Error Occured.", err, res, req);
            })
        }
    }

    return controller;
}