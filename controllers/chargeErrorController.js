
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const ActivityController = require('./activityController');
const UserControler = require('./userController');
class chargeErrorController {

    static sendEmailNotification(req) {
        let email = req.body.data.object.receipt_email;
        let amount = req.body.data.object.amount;

        return User.find({ email: email, role:4})
        .then((users)=>{
            if (!user.length) return;
             UserControler.getActiveUserByEmail(users[0].email).then(userId =>{
                ActivityController.create({
                    userId: userId,
                    title: 'Payment Declined',
                    type: 'Milestone',
                    notes: amount / 100,
                });
                return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, { user: user }, 'card-decline')
                    .then(() => {
                        return user;
                })
            })
            
        })
    }
    static chargeSuccess(req){
        let email = req.body.data.object.receipt_email;
        let amount = req.body.data.object.amount;
        return User.find({ email: email, role: 4 })
            .then((users) => {
                if (!user.length) return;
                 return UserControler.getActiveUserByEmail(users[0].email)
                 .then(userId => {
                    return ActivityController.create({
                        userId: userId,
                        title: 'Payment Success',
                        type: 'Milestone',
                        notes: amount / 100,
                    });
                })

            })
    }
}

module.exports = chargeErrorController;