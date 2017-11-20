module.exports = function (app) {
    var accountCtrl = app.controllers.AccountCtrl;
    app.get('/account/getById', accountCtrl.getAccountById);
};