var connection = require('../scripts/db.js');
var moment = require('moment');
module.exports = {
    makeDBRequest : function(queryObject, success) {
        connection.query('use half_dome_gym_app;');
        connection.query(queryObject, function(err, result) {
            success(err, result)
        });
    },

    getQueryObject : function(req) {
        var pageObject = {page : 1, pageSize : 10};
        if(req != null) {
            pageObject.page = req.query.page != null ? req.query.page : 1;
            pageObject.pageSize = req.query.pageSize != null ? req.query.pageSize : 10;
        }    
        return pageObject;
    },
    getUniqueCode : function (length) {
        var text = "";
        var combination = "0123456789";
        for (var i = 0; i < length; i++) {
            text += combination.charAt(Math.floor(Math.random() * combination.length));
        }
        return text;
    },
    getMembershipEndDate : function(typeId, dateString) {
        var startDate = new Date(moment(dateString, "DD/MM/YYYY HH:mm:ss").valueOf());
        if(typeId == 1) {
            startDate.setTime(startDate.getTime() + 24*60*60*1000);
        } else if(typeId == 2) {
            startDate.setTime(startDate.getTime() + 168*60*60*1000);
        } else if(typeId == 3) {
            startDate.setTime(startDate.getTime() + 720*60*60*1000);
        } else if(typeId == 4) {
            startDate.setTime(startDate.getTime() + 2160*60*60*1000);
        } else if(typeId == 5) {
            startDate.setTime(startDate.getTime() + 4320*60*60*1000);
        } else if(typeId == 6) {
            startDate.setTime(startDate.getTime() + 8640*60*60*1000);
        }
        return startDate; 
    }
}    