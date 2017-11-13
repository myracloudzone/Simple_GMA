var https = require('https');
var http = require('http');

module.exports = {
	makeHTTPSRequest : function(url, data, success) {
		var dataString = JSON.stringify(data);
		var req = https.request(url, function(res) {
			var responseString = '';
			res.setEncoding('utf8');
			res.on('data', function(data) {
				responseString += data;
			});
			
			res.on('end', function() {
				var responseObject = null;
				responseString = JSON.stringify(responseString);
				success(responseObject, res.statusCode)
			});
		});
		req.write(dataString);
		req.end();
    },
    makeHTTPRequest : function(url, data, success) {
		var dataString = JSON.stringify(data);
		var req = http.request(url, function(res) {
			var responseString = '';
			res.setEncoding('utf8');
			res.on('data', function(data) {
				responseString += data;
			});
			
			res.on('end', function() {
				var responseObject = null;
				responseString = JSON.stringify(responseString);
				success(responseObject, res.statusCode)
			});
		});
		req.write(dataString);
		req.end();
	}
};