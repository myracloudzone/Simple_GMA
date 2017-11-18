module.exports = function (app) {
    var memberMembershipCtrl = app.controllers.MemberMembershipCtrl;
    app.get('/membership/getMemebershipToMemberById', memberMembershipCtrl.getMemebershipToMemberById);
    app.post('/membership/addPayment', memberMembershipCtrl.addPayment);
    app.get('/membership/getTransactionHistory', memberMembershipCtrl.getMemberTransactionHistory);
    app.get('/membership/checkForMembershipUpgrade', memberMembershipCtrl.isMembershipUpgradeAllowed);
    app.post('/membership/updateMembershipOfMember', memberMembershipCtrl.updateMembershipOfMember);
    app.post('/membership/refundAmount', memberMembershipCtrl.refundAmount);
};