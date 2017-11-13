module.exports = function (app) {
  var authCtrl = app.controllers.AuthCtrl;
  app.post('/auth/login', authCtrl.login);
  app.post('/auth/logout', authCtrl.logout);
};