var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var smsSender = require('../lib/SmsSender.js');
var systemVariable = require(config.outputFolder+'/variable.json');
var transactionDAO = require('../dao/TransactionDAO.js');
var async = require('async');
var moment = require('moment');

module.exports = function(app) {
    var controller = {};
    controller.getTotalAmount = function(req, res, next) {
        transactionDAO.findAll({ accountId : req.headers.accountId }, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var totalAmountReceived = 0;
            var totalAmountForRefund = 0;
            async.mapSeries(data, function(v, cb) {
                if(v.transaction_type == 1) {
                    totalAmountReceived = totalAmountReceived + parseFloat(v.amount_paid);
                } else if(v.transaction_type == 2) {
                    totalAmountForRefund = totalAmountForRefund - parseFloat(v.amount_paid);
                }
                cb();
            })
            var response = {};
            response.refundAmount = totalAmountForRefund;
            response.receivedAmount = totalAmountReceived;
            return logger.logResponse(200, response, null, res, req);
        });
    }
    controller.getAllTransactionGroupByDate = function(req, res, next) {
        transactionDAO.findAll({ accountId : req.headers.accountId }, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            var response = {};
            var responseData = {};
            var responseRefundData = {};
            var responseBalanceRefundData = {};
            var uniquedates = [];
            var uniquerefunddates = [];
            var uniqueBalanceDates = [];
            var date = null;
            async.mapSeries(data, function(v, cb) {
                date = moment(parseFloat(v.date_created)).format('MMM YYYY');
                if(v.transaction_type == 1) {
                    if(uniquedates.indexOf(date) < 0) {
                        uniquedates.push(date);
                        responseData[date] = parseFloat(v.amount_paid);
                    } else {
                        var prevAmount = parseFloat(responseData[date]);
                        responseData[date] = prevAmount + parseFloat(v.amount_paid);
                    }
                    if(uniquerefunddates.indexOf(date) < 0) {
                        responseRefundData[date] = 0;
                    }
                    if(uniqueBalanceDates.indexOf(date) < 0) {
                        uniqueBalanceDates.push(date);
                        responseBalanceRefundData[date] = parseFloat(v.amount_paid);
                    } else {
                        var prevAmount = parseFloat(responseBalanceRefundData[date]);
                        responseBalanceRefundData[date] = prevAmount + parseFloat(v.amount_paid);
                    }

                } else if(v.transaction_type == 2) {
                    if(uniquerefunddates.indexOf(date) < 0) {
                        uniquerefunddates.push(date);
                        responseRefundData[date] = parseFloat(v.amount_paid);
                    } else {
                        var prevAmount = parseFloat(responseRefundData[date]);
                        responseRefundData[date] = prevAmount + parseFloat(v.amount_paid);
                    }
                    if(uniquedates.indexOf(date) < 0) {
                        responseData[date] = 0;
                    } 
                    if(uniqueBalanceDates.indexOf(date) < 0) {
                        uniqueBalanceDates.push(date);
                        responseBalanceRefundData[date] = parseFloat(v.amount_paid);
                    } else {
                        var prevAmount = parseFloat(responseBalanceRefundData[date]);
                        responseBalanceRefundData[date] = prevAmount + parseFloat(v.amount_paid);
                    }
                }
                cb();
            })
            var response = {};
            response.collectionData = responseData;
            response.refundData = responseRefundData;
            response.balanceData = responseBalanceRefundData;
            return logger.logResponse(200, response, null, res, req);
        });
    }
    return controller;
};