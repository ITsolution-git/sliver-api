const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const Statement = mongoose.model('Statement');
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
class ExcuteController {

    static setFinishBuild(req) {
        return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps})
        .then( () => {

            if (!req.body.data.firstTime) return user;

            let user = req.decoded;
            let mailData = {
                business_name: user.businessName,
                first_name: user.name,
                last_name: user.lastName,
                mailing_address: user.email,
                phone_number: user.phone,
            }
            if (user.role != 6) {
                return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, {user: mailData}, 'slap-stuff')
                .then(()=>{
                    return user;
                })
            }
        }); 
    }

}

module.exports = ExcuteController;