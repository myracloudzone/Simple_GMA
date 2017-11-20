
module.exports = function (app) {
    var dashboardCtrl = app.controllers.DashboardCtrl;
    app.get('/dashboard/getMembershipDueMembers', dashboardCtrl.getMembershipDueMembers);
    app.get('/dashboard/getMembersWithBirthdayRange', dashboardCtrl.getMembersWithBirthdayRange);
    app.get('/dashboard/getMembersCountByMonth', dashboardCtrl.getMembersCountByMonth);   
};