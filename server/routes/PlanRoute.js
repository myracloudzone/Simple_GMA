module.exports = function (app) {
    var planCtrl = app.controllers.MembershipPlanCtrl;
    app.post('/plan/deletePlanById', planCtrl.deletePlanById);
    app.post('/plan/addPlan', planCtrl.addPlan);
    app.post('/plan/updatePlan', planCtrl.updatePlan);
    app.get('/plan/getPlanById', planCtrl.getPlanById);
    app.get('/plan/list', planCtrl.getPlans);
}; 