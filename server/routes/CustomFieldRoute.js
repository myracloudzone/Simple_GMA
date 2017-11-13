
module.exports = function (app) {
    var customFieldCtrl = app.controllers.CustomFieldCtrl;
    app.post('/customfield/createField', customFieldCtrl.createField);
};
