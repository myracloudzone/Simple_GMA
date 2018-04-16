var nodeMailer = require("nodemailer");
var fs = require('fs');
var handlebars = require('handlebars');
var barcode = require('barcode');
var config = require('../scripts/config.json');
var systemVariable = require(config.outputFolder+'/variable.json');
var moment = require('moment');
const path = require('path');
// Send Grid Email
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(systemVariable.sendGridKey);
var sender =  systemVariable.email;  // The emailto use in sending the email
var password = systemVariable.emailPassword;  // password of the email to use


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
        user: sender,
        pass: password
    }
});

var sendMail = function(toAddress, subject, content, next){
    var mailOptions = {
        from: "GYM PRO Solution <" + sender  + ">",
        to: toAddress,
        replyTo: sender,
        subject: subject,
        html: content
    };
    smtpTransport.sendMail(mailOptions, next);
};

var sendMailWithAttachment = function(toAddress, subject, content, emailAttachments, next){
    var mailOptions = {
        from: "GYM PRO Solution <" + sender  + ">",
        to: toAddress,
        replyTo: sender,
        subject: subject,
        html: content,
        attachments: emailAttachments
    };
    smtpTransport.sendMail(mailOptions, next);
  };

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

var sendMemberRegistrationEmail = function(data, callback) {
    var fileName = (new Date()).getTime()+'.png';
    var outfile = config.outputFolder + '/tmp/' + fileName;
    var code39 = barcode('code128', {
        data: data.memberCode,
        width: 300,
        height: 100,
    });
    code39.saveImage(outfile, function (err) {
        if (err)  {
            callback(500, null, err);
        }
        readHTMLFile(__dirname + '/EmailHtml/Registration.html', function(err, html) {
            var template = handlebars.compile(html);
            data.profilePic = data.profilePic.replace('/media', config.outputFolder)
            var replacements = {
                memberId : data.memberId,
                memberName: data.memberName,
                mobileNumber: data.mobileNumber,
                dob: data.dob,
                status: data.status,
                address: data.memberAddress,
                bloodGroup: data.bloodGroup,
                memberCode: data.memberCode,
                emergencyContactName: data.memberEmergencyContactName,
                emergencyContactNumber: data.memberEmergencyContactNumber,
                email : data.memberEmail
            };
            var htmlToSend = template(replacements);
            var attachments = [{
                filename: fileName,
                path: outfile,
                cid: 'barcode'
            },{
                filename: path.basename(data.profilePic),
                path: data.profilePic,
                cid: 'profilePic'
            }]
            sendMailWithAttachment(data.memberEmail, 'Member Registration', htmlToSend, attachments, function(err, response) {
                if(err){
                    callback(500, null, err);
                }
                fs.unlink(outfile, function(err){
                    if(err) {
                        console.log("Error Occurred")
                    }
                    console.log("File Deleted Successfully.")
                });
                callback(200, "Mail Sent.", err);
            });
        });

    });
}

var sendMessage = function(data, callback) {
    readHTMLFile(__dirname + '/EmailHtml/MessageTemplate.html', function(err, html) {
        var htmlToSend = html.replace('{{message}}', data.msg);
        // sendSendGridEmail(data.to, data.subject, htmlToSend);
        sendMail(data.to, data.subject, htmlToSend, function(err, mailData) {
            if(err) {
                saveMessageHistory(data, 0); // Need to handle this by WebSocket // 0 error
                callback(500, "Error Occurred.", err);
            } else {
                saveMessageHistory(data, 1); // Need to handle this by WebSocket // 1 success
                callback(500, mailData, null);
            }
        })

    });
}

function saveMessageHistory(data, status) {
    var now = moment().unix();
    var obj = {};
    obj.type = 1;  // 1 represent Email
    obj.to_address = data.to;
    obj.from_address = sender;
    obj.subject = data.subject;
    obj.message = data.msg;
    obj.member_id = data.memberId;
    obj.status = status;
    obj.date_created = now;
    
    schema.model('MessageHistory').forge().save(obj).then(function(response) {
        console.log("Sent Successfully."); 
    }).catch(function(err) {
        console.log(err); 
    })
}

var sendSendGridEmail = function(to, subject, body) {
    var sendGridFrom = systemVariable.sendGridEmail;
    const msg = {
        to: to,
        from: sendGridFrom,
        subject: subject,
        text: 'and easy to do anywhere, even with Node.js',
        html: body,
    };
    sgMail.send(msg);
}

var sendEmailToServer = function(toAddress, subject, content, next) {
    var smtp = nodeMailer.createTransport({
        service: "Gmail",
        auth: {
            user: "vineet.vijay@epsilon.com",
            pass: "Mar2018#"
        }
    });
    var opt = {
        from: "Epsilon <" + "vineet.vijay@epsilon.com"  + ">",
        to: toAddress,
        replyTo: "vineet.vijay@epsilon.com",
        subject: subject,
        html: content
    };
    smtp.sendMail(opt, next);
}
module.exports = {
    sendMail : function(type, data, callback) {
        if(type == 'MEMBER_REGISTRATION') {
            sendMemberRegistrationEmail(data, callback);
        } else if(type == 'MESSAGE') {
            sendMessage(data, callback);
        } else if(type == 'USER_REGISTRATION') {
            
        } else {
            var htmlToSend = data.msg;
            sendEmailToServer(data.to, data.subject, htmlToSend, function(err, mailData) {
                console.log(err);
                console.log(mailData);
            })
        }
    }
}   

