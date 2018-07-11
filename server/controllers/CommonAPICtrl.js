var schema = require('bookshelf').DB;
const uuidv1 = require('uuid/v1');
var encryptionService = require("../lib/EncryptionDecryption.js");
var logger = require('../scripts/logger.js');
var moment = require('moment');
var commonUtils = require("./CommonCtrl.js");
const fs = require('fs');
const ytdl = require('ytdl-core');
const speech = require('@google-cloud/speech');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');


// Creates a client
const client = new speech.SpeechClient();

module.exports = function (app) {
	var controller = {};

	controller.getYouTubeInformation = function (req, res, next) {
		commonUtils.getYouTubeVideoDetails(req, req.query.id, req.headers, function(data, statusCode) {
            return logger.logResponse(200, {"response" : data}, null, res, req);
        });
    };
    
    controller.getYouTubeAudio = function (req, res, next) {
		// commonUtils.getYouTubeAudio(req, res, function(data, statusCode) {
        //     console.log(data);
        //     return logger.logResponse(200, {"response" : data}, null, res, req);
        // });
        console.log("ABCCC");
       
        
        // The name of the audio file to transcribe
        const fileName = './sss2.wav';
        


// Reads a local audio file and converts it to base64
const file = fs.readFileSync(fileName);
const audioBytes = file.toString('base64');

// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const audio = {
  content: audioBytes,
};
const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 44100,
  languageCode: 'en-US',
};
const request = {
  audio: audio,
  config: config,
};

// Detects speech in the audio file
client
  .recognize(request)
  .then(data => {
      console.log(data)
    const response = data[0];
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
    };
    
	return controller;
}
