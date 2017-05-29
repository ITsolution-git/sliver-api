const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const config = require('../../config');

class Mailer {
    
    static send(email, subject, content) {
        let transporter = nodemailer.createTransport(ses(config.mailer));
        
        return new Promise((resolve) => {
            return transporter.sendMail({
                    from: config.emailAddressAdmin,
                    to: email ? email : config.emailAddressAdmin,
                    subject: subject,
                    text: content
                },
                (err,result) => {
                    transporter.close();

                    if(err) {
                        console.log(err); // TODO: winston logger add;
                        return resolve(null);
                    }
                    return resolve(result);
                }); 
        });
    }
}

module.exports = Mailer;