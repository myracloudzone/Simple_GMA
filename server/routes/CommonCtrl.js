module.exports = function (app) {
    var commonCtrl = app.controllers.CommonAPICtrl;
    app.get('/common/getYouTubeVideoInformation', commonCtrl.getYouTubeInformation);
    app.get('/common/getYouTubeAudio', commonCtrl.getYouTubeAudio);
};