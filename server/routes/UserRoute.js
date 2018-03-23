module.exports = function (app) {
    var userCtrl = app.controllers.UserCtrl;
    app.get('/user/getLoggedInUser', userCtrl.getLoggedInUser);
    app.post('/user/changePassword', userCtrl.changePassword);
    app.get('/user/list', userCtrl.list);
    app.post('/user/createUser', userCtrl.createUser);
    app.post('/user/updateUser', userCtrl.updateUser);
    app.get('/user/getUser', userCtrl.getUser);
    app.post('/user/deleteUser', userCtrl.deleteUser);
};