var connection = require('../scripts/db.js');
var moment = require('moment');
var config = require('../scripts/config.json');
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
        // var startDate = new Date(moment(dateString, "DD/MM/YYYY HH:mm:ss").valueOf());
        var startDate = moment(dateString, "DD/MM/YYYY HH:mm:ss");
        if(typeId == 1) {
            // startDate.setTime(startDate.getTime() + 24*60*60*1000);
        } else if(typeId == 2) {
            // startDate.setTime(startDate.getTime() + 168*60*60*1000);
        } else if(typeId == 3) {
            startDate.add(1, 'M');
        } else if(typeId == 4) {
            startDate.add(1, 'Q');
        } else if(typeId == 5) {
            startDate.add(2, 'Q');
        } else if(typeId == 6) {
            startDate.add(1, 'y');
        }
        return new Date(startDate.valueOf()); 
    },
    getDocumentName : function(path) {
        var index = path.indexOf('_____');
        var name = path.substring((index+5), path.length);
        return name;
    },
    getDocumentRenderPath : function(path) {
        var renderPath = path.substring(config.outputFolder.length, path.length);
        return '/media' + renderPath;
    }

}    