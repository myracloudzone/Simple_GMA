module.exports = function (app) {
    var memberMembershipCtrl = app.controllers.MemberMembershipCtrl;
    app.get('/membership/getMemebershipToMemberById', memberMembershipCtrl.getMemebershipToMemberById);
    app.post('/membership/addPayment', memberMembershipCtrl.addPayment);
    app.get('/membership/getTransactionHistory', memberMembershipCtrl.getMemberTransactionHistory);  
};