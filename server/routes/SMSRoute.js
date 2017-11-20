module.exports = function (app) {
    var smsCtrl = app.controllers.SmsCtrl;
    app.post('/sms/sendMessage', smsCtrl.sendMessage);
   
};  