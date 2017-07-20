const mongoose = require('../libs/mongoose');
const Payment = mongoose.model('Payment');
const User = mongoose.model('User');
const Coupon = mongoose.model('Coupon');
const stripe = require('../services/stripe');
const StripeService = stripe.service;
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

    static getPaymentsByUserID(req) {
         return Payment.list({criteria: {userId: req.params.user_id}});
    }
    
    static chargeUser(req) {
        let Pay = new Payment();
        let user;
        return User.load({_id: req.params.user_id}).then(u => {
            Pay.products.push(Pay.createExtraPayment(req.body));
            user = u;

            return StripeService.createCharges(user, Pay.calculate())
            .then((res) => {
                return res;
            })
            .catch((err) => {
                console.log(err); //TODO: winston logger add
                return null;
            })
        })
        .then((charges) => {
            Pay.userId = user._id;
            Pay.status = charges ? 1 : 0;
            Pay.paymentDate = charges ? (charges.created * 1000) : new Date();
            Pay.amountCharges = charges ? (charges.amount / 100) : Pay.calculate();
            return StripeService.getCustomerById(user.stripeId);
        })
        .then((customer) => {
            Pay.amountSaved = customer.account_balance;
            Pay.save();
            if (Pay.status == 0) {
                let subject = 'Payment issue';
                let content = "Hi,there, " +
                    user.name + " " + user.lastName + " (" + user.businessName + ")" + " has a payment issue. The credit card was declined.\n" +
                    "Create a ticket for Pat to follow up with the client to solve payment issue.\n" +
                    "Kind regards,\n SLAPcenter Admin";
                return Mailer.send(null, subject, content);
            }
        })
        .then(() => {
            return;
        })
        .catch((err) => {
            console.log(err); // TODO: winston logger add;
        });
    }
}

module.exports = FinancialTrackerController;