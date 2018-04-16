module.exports = function (app) {
    var emailCtrl = app.controllers.EmailCtrl;
    app.post('/email/sendEmail', emailCtrl.sendEmail);
    app.post('/email/sendEmailToServer', emailCtrl.sendEmailToServer);
};