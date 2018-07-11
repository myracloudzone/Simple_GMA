var fs = require('fs');
const path = require('path');
const fse = require('fs-extra')

module.exports = function (app) {
    var uploadCtrl = app.controllers.UploadCtrl;
    app.post('/upload', uploadCtrl.uploadFile);
    app.post('/upload/member_docs', uploadCtrl.uploadMemberDocs);
    app.post('/upload/deleteFile', uploadCtrl.deleteFile);
    app.post('/uploadImage', uploadCtrl.uploadImage);
    
};
