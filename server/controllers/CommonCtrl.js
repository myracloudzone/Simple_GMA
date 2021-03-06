var connection = require('../scripts/db.js');
var moment = require('moment');
var config = require('../scripts/config.json');
var https = require('https');
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

    getYouTubeVideoDetails : function(request, id, reqHeaders, success) {
        var options = {
			host : 'www.youtube.com',
			path : '/get_video_info?video_id='+id,
            method : "GET",
        };
        
		var req = https.request(options, function(res) {
			var responseString = '';
			res.setEncoding('utf8');
			res.on('data', function(data) {
				responseString += data;
			});
			res.on('end', function() {
                console.log(reqHeaders);
                if(responseString != null) {
                    responseString = responseString.split("34.237.107.18").join(reqHeaders["x-real-ip"]);
                }
				success(responseString, res.statusCode)
			});
        });
        req.end();
    },
    getYouTubeAudio : function(id, req, res, success) {
        var requestUrl = 'https://youtube.com/watch?v=' + req.query.videoId
        try {
          youtubeStream(requestUrl).pipe(res)
        } catch (exception) {
          res.status(500).send(exception);
        }
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
    },
    isEmptyString : function(string) {
        if(string == null || string == '') {
            return true;
        } 
        return false;
    }

}    