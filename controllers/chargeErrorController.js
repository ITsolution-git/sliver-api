
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const ActivityController = require('./activityController');
class chargeErrorController {

    static sendEmailNotification(req) {
        let email = req.body.data.object.receipt_email;
        let amount = req.body.data.object.amount;

        return User.findOne({ email: email, stripeSubscription: { $ne: null }}).then((user)=>{
            if (!user) return;
            if(user.role !=6){
                ActivityController.create({
                    userId: user._id,
                    title: 'Payment Declined',
                    type: 'Milestone',
                    notes: amount / 100,
                });
                return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, { user: user }, 'card-decline')
                .then(() => {
                    return user;
                })
            }
        })
        
    }
}

module.exports = chargeErrorController;