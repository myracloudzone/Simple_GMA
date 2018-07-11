module.exports = function (app) {
    var attendanceCtrl = app.controllers.AttendanceCtrl;
    app.post('/attendance/checkIn', attendanceCtrl.checkIn);
    app.get('/attendance/getHistory', attendanceCtrl.getHistory);
};