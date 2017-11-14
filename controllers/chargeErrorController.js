
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
class chargeErrorController {

    static sendEmailNotification(req) {
        let email = req.body.receipt_email;
        activity.updatedBy = req.decoded ? req.decoded._doc._id : null;
        return User.findOne({email:email}).then((user)=>{
            Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, { user: user }, 'card-decline')
            .then(() => {
                return user;
            })
        })
        
    }
}

module.exports = chargeErrorController;