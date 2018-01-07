module.exports = function (app) {
    var passwordCtrl = app.controllers.PasswordCtrl;
    app.post('/password/updateUserPassword', passwordCtrl.updateUserPassword);
    app.post('/password/generateLoginOTP', passwordCtrl.generateLoginOTP);
    
};