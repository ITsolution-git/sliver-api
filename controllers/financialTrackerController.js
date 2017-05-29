const mongoose = require('../libs/mongoose');
const Payment = mongoose.model('Payment');
const User = mongoose.model('User');
const Coupon = mongoose.model('Coupon');

class FinancialTrackerController {

    static getPayments() {
        let data = [];
        return Payment.list()
            .then((payments) => {
                return Promise.all(
                    payments.map((payment) => {
                        return User.load({_id: payment.userId})
                            .then((user) => {
                                let pay = {
                                    user: user,
                                    payment: payment
                                };
        
                                return pay;
                            })
                            .then((pay) => {
                                if (!payment.couponId) {
                                    return data.push(pay);
                                }
        
                                return Coupon.load({_id: payment.couponId}).then((coupon) => {
                                    pay.coupon = coupon;
                                    return data.push(pay);
                                });
                            });
                    })
                );
            })
            .then(() => {
                return data;
            })
            .catch(err => console.log(err)); //TODO: winston add
    }
    
    static getPaymentsByUser(req) {
         return Payment.list({criteria: {userId: req.decoded._doc._id}});
    }


}

module.exports = FinancialTrackerController;