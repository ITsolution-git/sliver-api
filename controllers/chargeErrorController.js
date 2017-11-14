
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
class chargeErrorController {

    static sendEmailNotification(req) {
        let email = req.body.receipt_email;

        return User.findOne({email:email}).then((user)=>{
            if (!user) return;
            return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, { user: user }, 'card-decline')
            .then(() => {
                return user;
            })
        })
        
    }
}

module.exports = chargeErrorController;