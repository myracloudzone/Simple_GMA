module.exports = function (app) {
    var activityCtrl = app.controllers.ActivityCtrl;
    app.post('/activity/addActivity', activityCtrl.addActivity);
    app.post('/activity/deleteActivity', activityCtrl.deleteActivity);
    // app.get('/product/getProductById', productCtrl.getProductById);
    app.get('/activity/list', activityCtrl.getActivities);
    // app.post('/product/updateProduct', productCtrl.updateProduct);
}; 