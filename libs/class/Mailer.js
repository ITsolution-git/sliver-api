const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const config = require('../../config');
const sgTransport = require('nodemailer-sendgrid-transport');
const smtpTransport = require('nodemailer-smtp-transport');

const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');


const options = {
	auth: {
		api_key: config.SENDGRID_KEY
	}
}

class Mailer {
    
    static send(email, subject, htmlContent, textContent) {

        // let transporter = nodemailer.createTransport(smtpTransport({
        //     service: 'SES',
        //     auth: {
        //         user: config.AWS_SMTP.username,
        //         pass: config.AWS_SMTP.password,
        //     }
        // }));

        // let transporter = nodemailer.createTransport(sgTransport(options));

        // let transporter = nodemailer.createTransport(ses(config.mailer));
        // var transport = nodemailer.createTransport({
        //     host: "smtp.mailtrap.io",
        //     port: 2525,
        //     auth: {
        //         user: "b915eda702838b",
        //         pass: "f486219eeaba73"
        //     }
        // });

        var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth:
                {
                    user: "victor@silverlininglimited.com",
                    pass: "123calendar"
                }
        });

        return new Promise((resolve, reject) => {
            return transporter.sendMail({
                    from: config.emailAddressAdmin,
                    to: email ? email : config.emailAddressAdmin,
                    subject: subject,
                    html: htmlContent
                },
                (err,result) => {
                    transporter.close();

                    if(err) {
                        console.log(err); // TODO: winston logger add;
                        return reject(new Error('Failed to send email'));
                    }
                    return resolve(result);
                }); 
        });
    }

    static renderTemplateAndSend(email, locals, templateName) {
        let template = new EmailTemplate(path.join(__dirname, '../../emailtemplates', templateName));
        
        if(!template){
            // TODO create promise to send errors back;
            return new Promise((resolve, reject) => {
                reject("Error in Rendering template");
            });

        } else {
            return template.render(locals)
            .then(function (results) {
                return Mailer.send(email, results.subject, results.html, results.text);
            });
        }
    }
}


// Mailer.renderTemplate('erwin.keller0820@yahoo.com', {user: {name: 'JSDS', lastName: 'jss'}}, 'welcome');
// // using SendGrid's v3 Node.js Library
// // https://github.com/sendgrid/sendgrid-nodejs
// var helper = require('sendgrid').mail;
// var fromEmail = new helper.Email('roy.smith0820@gmail.com');
// var toEmail = new helper.Email('victor@silverlininglimited.com');
// var subject = 'Sending with SendGrid is Fun';
// var content = new helper.Content('text/plain', 'and easy to do anywhere, even with Node.js');
// var mail = new helper.Mail(fromEmail, subject, toEmail, content);

// var sg = require('sendgrid')(config.SENDGRID_KEY);
// var request = sg.emptyRequest({
//   method: 'POST',
//   path: '/v3/mail/send',
//   body: mail.toJSON()
// });

// sg.API(request, function (error, response) {
//   if (error) {
//     console.log('Error response received');
//   }
//   console.log(response.statusCode);
//   console.log(response.body);
//   console.log(response.headers);
// });

module.exports = Mailer;