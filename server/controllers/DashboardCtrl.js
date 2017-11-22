var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var smsSender = require('../lib/SmsSender.js');
var systemVariable = require(config.outputFolder+'/variable.json');
var async = require('async');
var moment = require('moment');
var accountDAO = require('../dao/AccountDAO.js');
var memberDAO = require('../dao/MemberDAO.js');

module.exports = function(app) {
    var controller = {};
    controller.getMembershipDueMembers = function(req, res, next) {
        var todayDate = req.query.filterDate;
        todayDate = moment(todayDate, "MM/DD/YYYY HH:mm:ss").add(15, 'days').valueOf();
        console.log(todayDate)
        var searchFilter = {};
        searchFilter.searchDate = todayDate;
        searchFilter.accountId = req.headers.accountId;
        searchFilter.active = true;
        memberDAO.getMembershipDueMembers(searchFilter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, data, null, res, req);
        });
    };
    controller.getMembersWithBirthdayRange = function(req, res, next) {
        var startDate = moment(req.query.filterDate, "MM/DD/YYYY HH:mm:ss").unix();
        var searchFilter = {};
        searchFilter.date = startDate;
        searchFilter.accountId = req.headers.accountId;
        searchFilter.active = true;

        var response = {};
        memberDAO.getMembersWithBirthdayRange(searchFilter, req, res, function(data, error, req, res) {
            if(error) {
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            response.birthdayData = data;
            memberDAO.getMembersWithJoiningAnniversaryRange(searchFilter, req, res, function(data, error, req, res) {
                if(error) {
                    return logger.logResponse(500, "Error Occured.", error, res, req);
                }
                response.anniversaryData = data;
                return logger.logResponse(200, response, null, res, req);
            });
        });
    };
    controller.getMembersCountByMonth = function(req, res, next) {
        var startDate = moment(req.query.filterDate, "MM/DD/YYYY HH:mm:ss").subtract(6, 'months').unix();
        var searchFilter = {};
        searchFilter.date = startDate;
        searchFilter.accountId = req.headers.accountId;
        searchFilter.active = true;
        memberDAO.getMembersCountByMonth(searchFilter, req, res, function(data, error, req, res) {
            if(error) {
                console.log(error)
                return logger.logResponse(500, "Error Occured.", error, res, req);
            }
            return logger.logResponse(200, {data : data}, null, res, req);
        });
    }
    return controller;
};