const mongoose = require('../../libs/mongoose');
const config = require('../../config');
const moment = require('moment');
const StripeError  = require('./errors/StripeError');
const stripe = require('stripe')(config.stripe_key);

const User = mongoose.model('User');
const Coupon = mongoose.model('Coupon');
const Product = mongoose.model('Product');

class Stripe {

    static sendReport() {
        let model = {user: mObj.user.toJSON(), isRenew: true };
        Mailer.renderTemplateAndSend(mObj.user.email, model, 'report-template')
    }

    static createCustomer(userData) {
        return new Promise( (resolve,reject) => {
            Stripe._createCard(userData.card)
                .then((cardSource) => Stripe._createCustomer(cardSource,userData))
                .then(resolve)
                .catch(reject);
        });
    }
    
    static _createCustomer(cardSource,userData) {
        return new Promise( (resolve,reject) => {
            let data = {
                source : cardSource.id,
                email : userData.email,
                metadata : {
                    customer_email : userData.email,
                    customer_name : userData.name
                }
            };
           stripe.customers.create(data, (err,customer) => {
               return err ? reject(new StripeError('Failed create customer', 'BAD_DATA', {orig: err})) : resolve(customer);
           });
        });
    }

    static _createCard(card) {
        card.exp_month = card.date.substring(0,2);
        card.exp_year = card.date.substring(2,6);

        delete card.date;        
        
        return new Promise( (resolve,reject) => {
            stripe.tokens.create({card : card}, (err,token) => {
                console.log(err);
                return err ? reject(new StripeError('We were unable to process your credit card.  Please try again or use a new card.', 'BAD_DATA', {orig: err.stack})) : resolve(token);
            });
        });
    }

    static createSubscription(customer, subscriptionId, coupon) {
        return new Promise((resolve, reject) => {
            let subscription = {
                'customer': customer.stripeId ? customer.stripeId : customer.id,
                'source': customer.default_source ? customer.default_source : customer.stripeSource,
                'items': [
                    {
                        'plan': subscriptionId
                    }
                ]
            };
            if (coupon) {
                subscription.coupon = coupon.code;
            }
            stripe.subscriptions.create(subscription, (err, subscription) => {
                console.log(err);
                return err ? reject(new StripeError('Failed to create subscription', 'BAD_DATA', {orig: err})) : resolve(subscription);
            });
        });
    }

    static deleteSubscription(subscriptionId) {
        return new Promise((resolve, reject) => {
            stripe.subscriptions.del(subscriptionId, (err, confirmation) => {
                console.log(err);
                return err ? reject(new StripeError('Failed to cancel subscription', 'BAD_DATA', {orig: err})) : resolve(confirmation);
            });
        });
    }

    static toggleSubscription(userId, enable) {
        return User.load({_id: userId}).then(user => {
            if (!enable) {
                if (user.stripeSubscription != null) {
                    return Stripe.deleteSubscription(user.stripeSubscription).then((confirmation) => {
                        user.stripeSubscription = null;
                        return user.save();
                    });
                } else {
                    return user;
                }
            } else {
                if (user.stripeSubscription == null) {
                    return Product.load({_id: user.planId}).then(product => {
                        return Coupon.load({_id: user.couponId}).then(coupon => {
                            return Stripe.createSubscription(user, product.productName, coupon).then(subscription => {
                                user.stripeSubscription = subscription.id;
                                return user.save();
                            })
                        })
                    });
                } else {
                    return user;
                }
            }
        });
    }
    
    static createCharges(customer,amount) {
        return new Promise((resolve,reject) => {
            stripe.charges.create({
                amount: amount * 100,
                currency: 'usd',
                source: customer.default_source ? customer.default_source : customer.stripeSource,
                customer: customer.stripeId ? customer.stripeId : customer.id
            }, (err,result) => {
                console.log(err);
                return err ? reject(new StripeError('Failed create charges', 'BAD_DATA', {orig: err.stack})) : resolve(result);
            });
        });
    }
    
    static getCustomerById(id) {
        return new Promise((resolve,reject) => {
            stripe.customers.retrieve(id, (err,result) => {
                return err ? reject(new StripeError('Failed create charges', 'BAD_DATA', {orig: err.stack})) : resolve(result);
            })
        })
    }

    static getPayments(userId) {
        return User.load({_id: userId}).then(user => {
            return new Promise( (resolve,reject) => {
                stripe.charges.list({customer: user.stripeId, limit: 10}, (err, payments) => {
                    // console.log(payments);
                    resolve(Promise.all(payments.data.map(payment => {
                        let result = {};
                        result.paymentDate = moment(new Date(payment.created * 1000)).format('ll');

                        return new Promise((resolve, reject) => {
                            stripe.invoices.retrieve(payment.invoice, (err, invoice) => {
                                // console.log("Got invoice: " + JSON.stringify(invoice));

                                if (invoice && invoice.lines.subscriptions && invoice.lines.subscriptions.length > 0) {
                                    result.programName = invoice.lines.subscriptions[0].plan.name;
                                    result.costProduct = invoice.lines.subscriptions[0].plan.amount / 100;

                                    result.discount = 0;
                                    if (invoice.discount && invoice.discount.coupon) {
                                        result.discount = '-' + (invoice.lines.subscriptions[0].amount - invoice.amount_due) / 100;
                                    }
                                    result.amountCharges = payment.amount / 100;
                                }
                                resolve(result);
                            });
                        });
                    })));

                });
            });
        });
    }
}

module.exports = Stripe;