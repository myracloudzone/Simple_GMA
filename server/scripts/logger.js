var logger = require('./filelogger.js');
module.exports = {
    logResponse : function(statusCode, response, error, requestResponseObject, req) {
        if(error) {
            logger.error("*****************************************--Warning Messagae--***********************************************");
            logger.error("--Request Url : "+req.url);
            logger.error("--Date : "+new Date());
            logger.error("--Status Code : "+statusCode);
            logger.error("--Cause : ");
            logger.error(error);
        } else {
            logger.info("******************************************--Info Messagae--***********************************************");
            logger.info("--Request Url : "+req.url);
            logger.info("--Date : "+new Date());
            logger.info("--Status Code : "+statusCode);
            logger.info("--Response : ");
            logger.info(response);
        } 
        logger.info("******************************************--------------------***********************************************");
        return requestResponseObject.status(statusCode).send(response);
    }
}