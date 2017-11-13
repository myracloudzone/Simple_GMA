var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');
var smsSender = require('../lib/SmsSender.js');
var systemVariable = require(config.outputFolder+'/variable.json');

module.exports = function(app) {
    var controller = {};
    controller.sendMessage = function(req, res, next) {
        var sendTo = req.body.mobileNumbers;
        var msg = req.body.msg;
        smsSender.sendMessage(sendTo, msg, req, res, function(data, statusCode, req, res) {
            res.send("Sent");
        })
    }
    return controller;
};