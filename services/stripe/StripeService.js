const mongoose = require('../../libs/mongoose');
const config = require('../../config');
const moment = require('moment');
const async = require('async');
const StripeError  = require('./errors/StripeError');
const stripe = require('stripe')(config.stripe_key);

const User = mongoose.model('User');
const Mindset = mongoose.model('slapMindset');
const Coupon = mongoose.model('Coupon');
const Product = mongoose.model('Product');
const extend = require('util')._extend;

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
               console.log(err);
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

    /**
     * couponName: refer to coupon on stripe for coupon: coupon_'m' is plan, coupon_'b' is build
     */
    static createSubscription(customer, subscriptionId, coupon, trialPeriod, costProduct, couponName) {
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
            //check if coupon is valid  
            if (coupon.typeCoupon != null) {
                subscription.coupon = couponName;
            }
            if (trialPeriod){
                subscription.trial_end = moment().add(1, 'M').format('X');
                if (coupon.typeCoupon != null && coupon.typeCoupon == 0) {
                    let description = ""
                    //monthly payment plan
                    if (coupon.name) {
                        description = "Confirmation of Monthly SLAP Plan with Monthly Payments starting next month"
                    }
                    //slapbuild plan
                    else {
                        description = "Confirmation of SLAPbuild Payment Plan with Monthly Payments starting next month"                        
                    }
                    let invoice_item = {
                        'customer':  customer.stripeId ? customer.stripeId : customer.id,
                        'amount': coupon.amount * 100,
                        'currency': 'usd',
                        'description': description
                    };
                    stripe.invoiceItems.create(invoice_item, (err, invoice_item) => {
                        stripe.subscriptions.create(subscription, (err, subscription) => {
                            console.log(err);
                            return err ? reject(new StripeError('Failed to create subscription', 'BAD_DATA', {orig: err})) : resolve(subscription);
                        });                    
                    })
                }
                else {
                    stripe.subscriptions.create(subscription, (err, subscription) => {
                        console.log(err);
                        return err ? reject(new StripeError('Failed to create subscription', 'BAD_DATA', {orig: err})) : resolve(subscription);
                    });                                        
                }
            }
            else {
                stripe.subscriptions.create(subscription, (err, subscription) => {
                    console.log(err);
                    return err ? reject(new StripeError('Failed to create subscription', 'BAD_DATA', {orig: err})) : resolve(subscription);
                });                
            }
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

    static toggleSubscription(userId, enable, trialPeriod) {
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
                            return Stripe.createSubscription(user, product.productName, coupon, trialPeriod).then(subscription => {
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
    static toggleBuildSubscription(userId, enable ,trialPeriod) {
        return User.load({ _id: userId }).then(user => {
            if (!enable) {
                if (user.stripeBuildSubscription != null) {
                    return Stripe.deleteSubscription(user.stripeBuildSubscription).then((confirmation) => {
                        user.stripeBuildSubscription = null;
                        return user.save();
                    });
                } else {
                    return user;
                }
            } else {
                if (user.stripeBuildSubscription == null) {
                    return Product.load({ _id: user.buildId }).then(product => {
                        return Coupon.load({ _id: user.couponId }).then(coupon => {
                            if (product.buildType === 1)
                                return Stripe.createSubscription(user, product.productName, coupon, trialPeriod).then(subscription => {
                                user.stripeBuildSubscription = subscription.id;
                                return user.save();
                            })
                            else return user.save();
                        })
                    });
                } else {
                    return user;
                }
            }
        });
    }
    
    static createCharges(customer,amount, description) {
        return new Promise((resolve,reject) => {
            stripe.charges.create({
                amount: amount * 100,
                currency: 'usd',
                description: description,
                source: customer.default_source ? customer.default_source : customer.stripeSource,
                customer: customer.stripeId ? customer.stripeId : customer.id
            }, (err, result) => {
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

    static getPayments(userId, count, invoices, from, to, stripeId) {
        let limit = 10;

        if(count >= 0 ){
            limit = count;
        }

        return User.load({_id: userId}).then(user => {
            return new Promise( (resolve,reject) => {
                    if (invoices && from && to && stripeId) {
                        stripe.charges.list({customer: stripeId, created: {gte: from, lte: to}}, (err, payments) => {
                            // console.log(payments);
                            if (payments) {
                                return Promise.all(payments.data.map(payment => {
                                        let result = {};
                                        result.paymentDate = moment(new Date(payment.created * 1000)).format('ll');
                                        result.amountCharges = payment.amount / 100;
                                        result.discount = 0;
                                        result.status = payment.paid ? 1 : 0;
                                        return result; 
                                }))
                                .then(userPayments => {
                                    resolve(userPayments);
                                })
                            } 
                            else {
                                resolve([]);
                            }
                        }) 
                    }
                else if (user && user.stripeId) {
                    stripe.charges.list({customer: user.stripeId, limit: limit}, (err, payments) => {
                        // console.log(payments);
                        if (payments) {
                            resolve(Promise.all(payments.data.map(payment => {
                                let result = {};
                                result.paymentDate = moment(new Date(payment.created * 1000)).format('ll');
                                result.amountCharges = payment.amount / 100;
                                result.discount = 0;

                                result.status = payment.paid ? 1 : 0;

                                return new Promise((resolve, reject) => {BuildSub
                                    stripe.invoices.retrieve(payment.invoice, (err, invoice) => {
                                        // console.log("Got invoice: " + JSON.stringify(invoice));

                                        if (invoice && invoice.lines.subscriptions && invoice.lines.subscriptions.length > 0) {
                                            result.programName = invoice.lines.subscriptions[0].plan.name;
                                            result.costProduct = invoice.lines.subscriptions[0].plan.amount / 100;

                                            if (invoice.discount && invoice.discount.coupon) {
                                                result.discount = '-' + (invoice.lines.subscriptions[0].amount - invoice.amount_due) / 100;
                                            }
                                        } else {
                                            result.programName = payment.description;
                                            result.costProduct = result.amountCharges;
                                        }
                                        resolve(result);
                                    });
                                });
                            })));
                        } else {
                            resolve([]);
                        }
                    });
                } else {resolve([]);}
            });
        });
    }

    static updateSubscriptions() {
        return new Promise(function (resolve, reject) {
            User.find({role: '4'}).exec().then(users => {
                users = users.filter(user => user.stripeSubscription);
                console.log(users.length + " users with active subscriptions");
                async.eachSeries(users, (user, cb) => {
                    console.log("Checking user " + user.name + " " + user.lastName);
                    Mindset.find({userId: user._id}).exec().then(mindsets => {
                        if (mindsets && mindsets.length > 0 && mindsets[0].slapStartDate) {
                            let mindset = mindsets[0];


                            let startYear = +mindset.slapStartDate.year;
                            let startMonth = +mindset.slapStartDate.month;

                            let endYear = startYear + 1;
                            let endMonth = startMonth - 1;

                            console.log("Start date " + startYear + "-" + startMonth);
                            console.log("End date " + endYear + "-" + endMonth);

                            if (moment().year() >= endYear && moment().month() + 1 >= endMonth) {
                                console.log("User " + user.name + " " + user.lastName + " has the last month of their SLAP year");
                                stripe.subscriptions.retrieve(user.stripeSubscription, (err, subscription) => {
                                    if (err) {
                                        console.log(err);
                                        return cb(StripeError('Failed retrieve subscription'));
                                    } else {
                                        console.log("Subscription created on " + moment.unix(subscription.created).format());
                                        // if day of subscription creation already in the past - cancel subscription
                                        if (moment.unix(subscription.created).date() <= moment().date()) {
                                            console.log("Canceling subscription...");
                                            return Stripe.deleteSubscription(user.stripeSubscription).then(confirmation => {
                                                console.log("Canceled subscription of user " + user.name + " " + user.lastName);
                                                user.stripeSubscription = null;
                                                return user.save();
                                            }, err => {
                                                console.log(err);
                                                cb();
                                            }).then((user) => {
                                                if (user.stripeBuildSubscription) {
                                                    return Stripe.toggleBuildSubscription(user._id, false);
                                                    // Stripe.deleteSubscription(user.stripeBuildSubscription).then(confirmation => {
                                                    //     console.log("Canceled subscription of user " + user.name + " " + user.lastName);
                                                    //     user.stripeBuildSubscription = null;
                                                    //     return user.save();
                                                    // }) 
                                                } else return user;
                                            }).then((user) => {
                                                return User.findOne({ awaitCreationSubscription: true, email: user.email }).exec().then(user =>{
                                                    if (user) {
                                                        return Stripe.toggleSubscription(user._id, true, user.stripeBuildSubscription).then((user) => {
                                                            if (user.buildId) {
                                                                return Stripe.toggleBuildSubscription(user._id, true, user.stripeBuildSubscription).then(user => {
                                                                    return User.findByIdAndUpdate(user._id, {awaitCreationSubscription: false}).then(cb);
                                                                });
                                                            }
                                                            else return User.findByIdAndUpdate(user._id, {awaitCreationSubscription: false}).then(cb);
                                                        })
                                                    } else {
                                                        return cb();
                                                    }
                                                })
                                            });
                                            
                                        } else {
                                            return cb();
                                        }
                                    }
                                });
                            } else {
                                console.log("Let them continue slapping");
                                cb();
                            }
                        } else {
                            cb();
                        }
                    })
                }, function () {
                    resolve();
                });
            });
        });
    }

    /**
     * create two coupons on stripe for each coupon
     * one for plan, the other one for build
     * naming convention is one for plan is gonna be like couponData.code + "_m", one for build is goona be like couponData.code + "_b"
     * for instance if coupon code is "coupon" then coupon for plan will be 'coupon_m' whereas for plan will be 'coupon_b'
     */
    static createCoupon(couponData){   
        return new Promise((resolve, reject) => {
            let duration = ['once', 'forever', 'repeating'];

            let coupon = {
                duration: duration[couponData.duration-1]
            }
            if (coupon.duration === 'repeating'){
                coupon.duration_in_months = couponData.durationLimited;
            }
            if (couponData.dateUntil){
                coupon.redeem_by = new Date(couponData.dateUntil).getTime() / 1000;
            }
            if (couponData.redemption){
                coupon.max_redemptions = +couponData.redemption                
            }

            let coupon_m = {}, 
                coupon_b = {};
            if (couponData.amount) {
                coupon_m = extend({
                    id: couponData.code + "_m",
                }, coupon);     
                if (couponData.typeCoupon) 
                    coupon_m.percent_off = +couponData.amount;
                else {
                    coupon_m.currency = 'USD';
                    coupon_m.amount_off = +couponData.amount * 100;
                }                
            }
            if (couponData.slapBuild.plan) {
                coupon_b = extend({
                    id: couponData.code + "_b"
                }, coupon);
                if (couponData.slapBuild.typeCoupon)
                    coupon_b.percent_off = +couponData.slapBuild.amount;
                else {
                    coupon_b.currency = 'USD';
                    coupon_b.amount_off = +couponData.slapBuild.amount * 100;
                }
            } 

            if (coupon_m.id)
            {
                stripe.coupons.create(coupon_m, (err, _coupon_m)=> {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (coupon_b.id) {
                            stripe.coupons.create(coupon_b, (err, _coupon_b) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve([_coupon_m, _coupon_b])
                                }
                            })
                        }
                        else {
                            resolve([_coupon_m])
                        }
                    }
                });
            }    
            else if (coupon_b.id) {
                stripe.coupons.create(coupon_b, (err, _coupon_b) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve([_coupon_b])
                    }
                })
            }
        })
    }

    static deleteCoupon(couponId){
        return new Promise((resolve, reject) => stripe.coupons.del(couponId, (err) => err ? reject(err) : resolve()))
    }

    static createPlan (planData){
        return new Promise((resolve, reject) => {
            let plan = {
                amount: +planData.costProduct * 100,
                interval: "month",
                name: planData.productName,
                currency: "usd",
                id: planData.productName,
                interval_count: planData.billingFrequency
            }
         
            stripe.plans.create(plan, (err, plan) => err ? reject(err) : resolve(plan));
        })
    }
    static deletePlan(planId) {
        return new Promise((resolve, reject) => stripe.plans.del(planId, (err) => err ? reject(err) : resolve()))
    }
}

module.exports = Stripe;