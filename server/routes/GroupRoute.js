module.exports = function (app) {
  var groupCtrl = app.controllers.GroupCtrl;
  app.post('/group/add', groupCtrl.addGroup);
  app.get('/group/list', groupCtrl.getGroups);
  app.get('/group/getById', groupCtrl.getGroupById);
  app.post('/group/deleteGroupById', groupCtrl.deleteGroupById);
  app.post('/group/assignGroupToMember', groupCtrl.assignGroupToMember);
};