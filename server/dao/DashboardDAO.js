var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    save : function(obj, req, res, callback) {
        schema.model('MembershipPlan').forge().save(obj).then(function(plan) {
            if(plan == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            }
            callback(plan.toJSON(), null, req, res);        
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    }
}