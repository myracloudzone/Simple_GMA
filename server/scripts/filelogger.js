var winston = require('winston')
var config = require('./config.json')
const log = require('simple-node-logger').createSimpleLogger('applogs.log');
module.exports = {
    error : function(msg, typeId) {
        log.error(msg);
    },
    info : function(msg, typeId) {
        // log.info(msg);
    }
}