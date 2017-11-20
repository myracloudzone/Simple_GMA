module.exports = function (app) {
    var userCtrl = app.controllers.UserCtrl;
    app.get('/user/getLoggedInUser', userCtrl.getLoggedInUser);
    app.post('/user/changePassword', userCtrl.changePassword);
};