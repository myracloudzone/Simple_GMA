var schema = require('bookshelf').DB;
var async = require('async');
var moment = require('moment');
var commonUtils = require("../controllers/CommonCtrl.js");

module.exports = {
    saveSentMessageHistory : function(obj, req, res, callback) {
        schema.model('MessageSentHistory').forge().save(obj).then(function(sms) {
            if(sms == null) {
                callback(null, "Unknown Error occurred while saving.", req, res);
            } else {
                callback(sms.toJSON(), null, req, res); 
            }
        }).catch(function(err) {
            callback(null, err, req, res);
        })
    },
    getSentMesssageHistory : function(condition, req, res, callback) {
        if(req.headers.roleId == 2) {
            condition.senderUserId = req.headers.userId;
        }
        if(condition.search == null) {
            condition.search = '';
        }
        if(condition.messageType == null) {
            condition.messageType = 1;
        }    
        schema.model('MessageSentHistory').forge().query( function(qb) {
            qb.leftJoin('user', function() {
                this.on('messageSentHistory.senderUserId', '=', 'user.id')
            }).leftJoin('member', function() {
                this.on('messageSentHistory.memberId', '=', 'member.id')
            })
            .where('messageSentHistory.accountId', condition.accountId)
            .andWhere('user.name', 'like', '%'+condition.search+'%')
            .andWhere('messageSentHistory.messageType', condition.messageType)
            .column('messageSentHistory.id as id', 'messageSentHistory.senderUserId','messageSentHistory.messageReceipentType', 'messageSentHistory.messageType', 'messageSentHistory.memberId', `messageSentHistory.subject`, 'messageSentHistory.message',
            'messageSentHistory.status', `messageSentHistory.dateCreated`, 'messageSentHistory.toAddress', 'messageSentHistory.fromAddress', 'messageSentHistory.mobile', 'messageSentHistory.accountId', 'member.first_name as firstName', 'member.last_name as lastName', 'user.name as senderName')
            .orderBy(condition.sortField, condition.sortOrder)
            .debug(true);
        }).fetchPage(commonUtils.getQueryObject(req)).then(function (history) {
            console.log("----------------------------------------------------------");
            console.log(history)
            var data = {};
            data.data = history.toJSON();
            data.pagination = history.pagination;
            callback(data, null, req, res);
        });
        




        // schema.model('MessageSentHistory').forge().where(condition).orderBy('dateCreated', 'DESC').fetchAll().then(function (result) {
        //     if(result == null) {
        //         callback([], null, req, res);
        //     }
        //     callback(result.toJSON(), null, req, res);
		// }).catch(function (err) {
		// 	callback(null, err, req, res);
        // });
    }
};