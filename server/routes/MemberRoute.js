module.exports = function (app) {
    var memberCtrl = app.controllers.MemberCtrl;
    app.post('/member/add', memberCtrl.addMember);
    app.get('/member/list', memberCtrl.getMembers);
    app.get('/member/getById', memberCtrl.getMemberById);
    app.post('/member/update', memberCtrl.updateMember);
    app.post('/member/delete', memberCtrl.deleteMemberById);
    app.get('/member/documents', memberCtrl.getDocumentByMemberId);
    app.get('/member/count', memberCtrl.getActiveMemberCount);
  };