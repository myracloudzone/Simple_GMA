var fs = require('fs');
const path = require('path');
var mime = require('mime');
const fse = require('fs-extra');
var config = require('../scripts/config.json');
var logger = require('../scripts/logger.js');

module.exports = function(app) {
    var controller = {};
    controller.uploadFile = function(req, res, next) {
        if (!req.files) {
            return res.status(400).send('No files were uploaded.');
        }
    
        let testFile = req.files.file;
        let filePath = req.headers.accountId+'/profile_pic/'+(new Date()).getTime()+testFile.originalFilename;
        fse.copy(testFile.path, config.outputFolder + '/' + filePath, err => {
            if (err) {
                return logger.logResponse(500, err, err, res, req);
            }
            return logger.logResponse(200, '/media/'+filePath, null, res, req);    
        })
    };

    controller.uploadMemberDocs = function(req, res, next) {
        if (!req.files) {
            return res.status(400).send('No files were uploaded.');
        }
    
        let testFile = req.files.file;
        let filePath = req.headers.accountId+'/documents/'+req.body.memberId+'/'+(new Date()).getTime()+'_____'+testFile.originalFilename;
        fse.copy(testFile.path, config.outputFolder + '/' + filePath, err => {
            if (err) {
                return logger.logResponse(500, err, err, res, req);
            }
            return logger.logResponse(200, '/media/'+filePath, null, res, req);
        })
    }

    controller.deleteFile = function(req, res, next) {
        fs.unlink(req.body.filePath, function(err){
            if(err) {
                return logger.logResponse(500, err, err, res, req);
            }
            return logger.logResponse(200, 'Successfully Deleted.', null, res, req);
       });  
    }

    return controller;
};