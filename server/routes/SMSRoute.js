module.exports = function (app) {
    var smsCtrl = app.controllers.SmsCtrl;
    app.post('/sms/sendMessage', smsCtrl.sendMessage);
    app.post('/sms/sendGroupMessage', smsCtrl.sendGroupMessage);
    app.get('/sms/getSentMesssageHistory', smsCtrl.getSentMesssageHistory);
};  