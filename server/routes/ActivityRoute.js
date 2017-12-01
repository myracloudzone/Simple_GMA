module.exports = function (app) {
    var activityCtrl = app.controllers.ActivityCtrl;
    app.post('/activity/addActivity', activityCtrl.addActivity);
    app.post('/activity/deleteActivity', activityCtrl.deleteActivity);
    app.get('/activity/getActivityById', activityCtrl.getActivityById);
    app.get('/activity/list', activityCtrl.getActivities);
    app.post('/activity/updateActivity', activityCtrl.updateActivity);
}; 