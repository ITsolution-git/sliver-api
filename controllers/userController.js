const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const config = require('../config');
const Mailer = require('../libs/class/Mailer');
const slapMindset = mongoose.model('slapMindset');
const IdealClient = mongoose.model('IdealClient');
const Statement = mongoose.model('Statement');
const YearGoal = mongoose.model('YearGoal');
const ActionPlan = mongoose.model('ActionPlan');
var Grid = require('gridfs-stream');
const stripe = require('../services/stripe');
const stripeS = require('stripe')(config.stripe_key);
const Product = mongoose.model('Product');
const Coupon = mongoose.model('Coupon');
const Promise = require('bluebird');
const StripeService = stripe.service;
const Moment = require('moment');
const _ = require('lodash');
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db, mongoose.mongo);
let activityController = require('./activityController');
class UserController {
    
    static createUser(req) {
        return (new User(req.body)).save()
        .then(function(user){
            return user.safe();
        })
        .catch(function(err){
            // if (11000 === err.code || 11001 === err.code) {
            //     var MongooseError = require('mongoose/lib/error')
            //     var valError = new MongooseError.ValidationError(err)
            //     valError.errors["xxx"] = new MongooseError.ValidatorError('xxx', 'Duplicate found', err.err)
            //     err = valError;
            //     return err;
            // }
            throw err;
        });
    }

    static getUsers() {
        return User.list()
        .then(function(users){
            return users.map(user=>{
                return user.safe();
            });
        });
    }

    static getTestUsers(){
        return User.find({role:6});
    }

    static getUser(req) {
        return User.load({_id: req.params.id})
        .then((user) => {
            return user.safe();
        });
    }
    static getActiveUserByEmail(email){
        //let email = 'wanyaka44@gmail.com';
        return User.find({email:email})
        .then((users)=>{
            //console.log(users);
            return Promise.map(users, user =>{
                return slapMindset.find({ userId: user._id })
            }).then(mindests =>{
                let StartDateWithId = mindests.filter((mindset) =>
                     mindset[0] && mindset[0].slapStartDate
                ).map(mindset =>{
                    return {
                        userId: mindset[0].userId,
                        slapStartDate: Moment({ year: mindset[0].slapStartDate.year, month: mindset[0].slapStartDate.month - 1 }).format('YYYY-MM-DD')
                    }
                }).sort((date1,date2) =>{
                    return new Date(date2)-new Date(date1);
                }).find((date)=>{
                    return Moment(date.slapStartDate).isBefore(new Date());
                });
                return StartDateWithId ? StartDateWithId.userId:null;
            })

        });
    }
    static updateUser(req) {
        let bizName;
        let userObj;
        return User.load({_id: req.body._id}).then(function(user){
            bizName = user._doc.businessName;
            userObj = user;
            if (req.body.pausingPayment != user.pausingPayment) {
                return UserController.changePaymentStatus(req.body, user).then(()=>{
                    user.pausingPayment = req.body.pausingPayment;
                    user.save((err, user) => {
                        if (err) {
                            return Promise.reject(err);
                        }
                        return Promise.resolve(user);
                    })
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            else { 
                return User.list({ criteria: { email: userObj._doc.email } })
                    .then(users => {
                        return Promise.all( users.map(function(user){
                            if(user.id == userObj._id) {// If user is current user, update all other informations.
                                user.expertId = req.body.expertId; 
                                user.pausingPayment = req.body.pausingPayment;
                                user.couponId = req.body.couponId;
                            }
                            user.businessName = req.body.businessName;
                            user.name = req.body.name;
                            user.lastName = req.body.lastName;
                            user.role = req.body.role;
                            user.status = req.body.status;
                            user.email = req.body.email;
                            user.phone = req.body.phone;
                            if(req.body.password)  //Avoid to set password undefined
                                user.password = req.body.password;

                            user.partnerId = req.body.partnerId;
                            
                            user.extrainfo = req.body.extrainfo;
                            return user.save();
                        }));
                    })
                    .then(() => {
                        return new Promise((resolve, reject) => {
                            if (req.body.role == 4){
                                User.load({_id: req.body._id}).then(function(user){              
                                    stripeS.subscriptions.retrieve(user.stripeSubscription).then((subscription) => {
                                            if (subscription)
                                                if (req.body.planId != user.planId) {
                                                    Product.load({_id: req.body.planId}).then(product => {
                                                        stripeS.plans.retrieve(product.productName, (err, plan) => {
                                                            stripeS.subscriptionItems.update(subscription.items.data[0].id, {plan: product.productName}).then((transfer) => {
                                                                user.planId = product._id;
                                                                user.save((err,user) => {                                                    
                                                                    if (err) {
                                                                        reject(err);
                                                                    }
                                                                    resolve({user: user, subscription: subscription});
                                                                })                                
                                                            })
                                                        })
                                                    })
                                                }
                                                else {
                                                    resolve({user: user, subscription: subscription});
                                                }                                
                                    })
                                })
                            }
                        });
                    })
                    .then((data) => {
                        let user = data.user;
                        let subscription = data.subscription;
                        return new Promise((resolve, reject) => {
                            if (user.couponId) {
                                Coupon.load({_id: req.body.couponId}).then(coupon => {
                                    //assume that brand-new naming convention-based coupons are only applied whereas old ones are not applied
                                    //for monthly payment plan, but not for SLAPbuild
                                    if (coupon.validateSignUp(req.body.planId, user.buildId).length === 0) {
                                        stripeS.subscriptions.update(subscription.id, {coupon: coupon.code + "_m"}, (err, subscription) => {
                                            if (err) 
                                                reject(err);
                                            else {
                                                user.couponId = coupon._id;
                                                user.save((err, user) => {
                                                    if (err) {
                                                        reject(err);
                                                    }
                                                    else {
                                                        resolve(user);
                                                    }
                                                })                                                                         
                                            }
                                        })
                                    }
                                    else {
                                        stripeS.subscriptions.update(subscription.id, {coupon: null}, (err, subscription) => {
                                                if (err) 
                                                    reject(err);
                                                else {
                                                    user.couponId = null;
                                                    user.save((err, user) => {
                                                        if (err) {
                                                            reject(err);
                                                        }
                                                        else {
                                                            reject(new Error("the plan has changed successfully but the coupon is not applicable to this plan!"));
                                                        }
                                                    })                                                                         
                                                }
                                        })                                                                                                            
                                    }
                                })           
                            }
                        })
                    })    
                    .catch(err => {
                        return Promise.reject(err);
                    })                
            }
        })
    }
                // if ((user.status == 'inactive' || user.status == 'deleted') && user.stripeSubscription != null) {
                //     return StripeService.deleteSubscription(user.stripeSubscription).then(subscription => {
                //         user.stripeSubscription = null;
                //         return user.save();
                //     });
                // } else {
                //     return user;
                   // }

    static changePaymentStatus(reqUser, savedUser){
        return new Promise((resolve, reject) => {
            UserController.getActiveUserByEmail(savedUser.email)
            .then(userId =>{
                console.log(userId)
                let activity = {
                    userId: userId,
                    type: 'Other'
                }
                if (reqUser.pausingPayment){
                    stripeS.subscriptions.del(savedUser.stripeSubscription, {at_period_end: true}, (err, confirmation) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            if (savedUser.stripeBuildSubscription) {
                                stripeS.subscriptions.del(savedUser.stripeBuildSubscription, {at_period_end: true}, (err, confirmation) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        activity.title = 'PaymentPaused';
                                        activity.notes = savedUser.businessName + ' was paused Payment.'
                                        resolve(activityController.create(activity));
                                    }
                                });
                            }
                            else {
                                activity.title = 'PaymentPaused';
                                activity.notes = savedUser.businessName + ' was paused Payment.'
                                resolve(activityController.create(activity));
                            }
                        }
                    })
                }
                else {
                    stripeS.subscriptions.retrieve(savedUser.stripeSubscription, (err, subscription) => {
                        var item_id = subscription.items.data[0].id;
                        Product.load({_id: savedUser.planId}).then(product => {                
                            var items = [
                                {
                                    id: item_id,
                                    plan: product.productName
                                }
                            ]
                            stripeS.subscriptions.update(savedUser.stripeSubscription, {items: items}, (err, subscription) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    if (savedUser.stripeBuildSubscription) {
                                        stripeS.subscriptions.retrieve(savedUser.stripeBuildSubscription, (err, subscription) => {
                                            var item_id = subscription.items.data[0].id;
                                            Product.load({_id: savedUser.buildId}).then(product => {                
                                                var items = [
                                                    {
                                                        id: item_id,
                                                        plan: product.productName
                                                    }
                                                ]
                                                stripeS.subscriptions.update(savedUser.stripeBuildSubscription, {items: items}, (err, subscription) => {
                                                    if (err) {
                                                        reject(err);
                                                    }
                                                    else {
                                                        activity.title = 'PaymentActivated';
                                                        activity.notes = savedUser.businessName + ' was activated Payment.';
                                                        resolve(activityController.create(activity));
                                                    }                                        
                                                });
                                            });
                                        });
                                    }
                                    else {
                                        activity.title = 'PaymentActivated';
                                        activity.notes = savedUser.businessName + ' was activated Payment.';
                                        resolve(activityController.create(activity));
                                    }
                                }
                            })
                            
                        });
                    });
                }    
            })
        })        
    }
    static updateMe(req) {
        var bizName;
        var userObj;
        return User.load({_id: req.decoded._doc._id}).then(function(user){
            bizName = user._doc.businessName;
            userObj = user;
            return User.list({criteria: {businessName: bizName}});
        })
        .then(function(users){
            return Promise.all( users.map(function(user){
                if(user.id == userObj._id) {// If user is current user, update all other informations.
                    user.expertId = req.body.expertId; 
                    user.pausingPayment = req.body.pausingPayment;
                    user.couponId = req.body.couponId;
                }
                
                user.businessName = req.body.businessName;
                user.name = req.body.name;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.role = req.body.role;
                user.status = req.body.status;
                user.phone = req.body.phone;
                if(req.body.password)
                    user.password = req.body.password;
                user.partnerId = req.body.partnerId;
                user.extrainfo = req.body.extrainfo;
                return user.save();
            }));
        })
        .then(function(responses){
            return activityController.create({ userId: req.decoded._doc._id,
                                        title: 'Updated Account Info', 
                                        type: 'Other',  
                                        notes: bizName + ' updated account information.'});
        })
        .then(()=>{
            return User.load({_id: req.decoded._doc._id});
        })
        .then((user) => {
            return user.safe();
        })
    }

    static changeMyPassword(req) {

    }

    static deleteUser(req) {
        return User.load({_id: req.params.id})
        .then(user => {
            return User.find({email: user.email})
            .then(users => {
                return Promise.map(users, user => {
                    return StripeService.toggleSubscription(user._id, false);
                })
            })
        })
        .then(users => { 
            return Promise.map(users, user => {
                if (user.status != 'archived') {
                    user.status = 'archived';
                    return user.save();
                }
                else {
                    return User.delete({_id: user._id});
                }
            })   
        })
        .then(users=>{
            users.map(user => {
                if (user.safe) {
                    return user.safe();
                }
            })  
        })
    }

    static activateUser(req) {
        return User.load({_id: req.params.id})
        .then(user => {
            return User.find({email: user.email})
            .then(users => {
                return UserController.getActiveUserByEmail(users[0].email)
                .then(id =>{
                    return StripeService.toggleSubscription(id, true);
                }).then(()=>{
                    return users;
                })
            
            })
        })
        .then(users => { 
            return Promise.map(users, user => {
                user.status = 'active';
                return user.save();
            })
        })
        .then(users => {
            users.map(user => {
                if (user.safe) {
                    return user.safe();
                }
            })
        }).catch(()=>{
            User.load({ _id: req.params.id })
            .then(user =>{
                return User.find({ email: user.email })
            }).then(users =>{
                return Promise.map(users, user => {
                    user.status = 'active';
                    return user.save();
                })
            })
        })
    }


    static getFinishedSteps(req, _id) {
        let select = 'finishedSteps';
        let userId = req ? req.decoded._doc._id : _id;
        let data = {};
        return User.load({_id: userId}, select)
            .then((steps) => {
                if (steps.finishedSteps.length <= 0) return null;

                data.steps = steps;

                return slapMindset.load({userId: userId})
                    .then((slapMindset) => {
                        data.slapMindset = slapMindset;
                        return IdealClient.load({userId: userId});
                    })
                    .then((idealClient) => {
                        data.idealClient = idealClient;
                        return Statement.load({userId: userId})
                    })
                    .then((statement) => {
                        data.statement = statement;
                        return YearGoal.load({userId: userId})
                    })
                    .then((yearGoal) => {
                        data.yearGoal = JSON.parse(JSON.stringify(yearGoal));
                        if ( yearGoal && yearGoal.revenueStreams) { 
                            data.yearGoal.sellingPrice = yearGoal.revenueStreams;
                            data.yearGoal.variableBusinessExpenses = yearGoal.revenueStreams;
                            data.yearGoal.profitMargin = yearGoal.revenueStreams;
                            data.yearGoal.revenueBreakdown = yearGoal.revenueStreams;
                            data.yearGoal.yourYearGoal = yearGoal.revenueStreams;
                            data.yearGoal.adjustYourYearGoal = yearGoal.revenueStreams;
                            
                            data.yearGoal.commitYourYearGoal = yearGoal.revenueStreams;
                        }
                        return ActionPlan.load({userId: userId})
                    })
                    .then((actionPlan) => {
                        data.actionPlan = JSON.parse(JSON.stringify(actionPlan));
                        if ( actionPlan && data.slapMindset.slapStartDate ) {
                            data.actionPlan.doubleCheckStartDate = JSON.parse(JSON.stringify(data.slapMindset.slapStartDate));
                        } 
                        if ( actionPlan && data.actionPlan.whatsHappening) {
                            data.actionPlan.connectingStrategyStrategizing = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));

                            data.actionPlan.doubleCheckYearGoal = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));

                            data.actionPlan.chooseYourConnectingStrategies = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));
                            data.actionPlan.actionItems = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));   
                            data.actionPlan.quarterlyGoals = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));
                            data.actionPlan.commitToYourActionPlan = JSON.parse(JSON.stringify(data.actionPlan.whatsHappening));(JSON.stringify(data.actionPlan.whatsHappening));
                            
                        }
                        return data;
                    });
            });
    }
    static getFinishedStepsForUser(req) {
        let select = 'finishedSteps';
        let userId = req.params.user_id;
        let data = {};
        return User.load({_id: userId}, select)
            .then((steps) => {
                if (steps.finishedSteps.length <= 0) return null;

                data.steps = steps;

                return slapMindset.load({userId: userId})
                    .then((slapMindset) => {
                        data.slapMindset = slapMindset;
                        return IdealClient.load({userId: userId});
                    })
                    .then((idealClient) => {
                        data.idealClient = idealClient;
                        return Statement.load({userId: userId})
                    })
                    .then((statement) => {
                        data.statement = statement;
                        return YearGoal.load({userId: userId})
                    })
                    .then((yearGoal) => {
                        data.yearGoal = JSON.parse(JSON.stringify(yearGoal));
                        return ActionPlan.load({userId: userId})
                    })
                    .then((actionPlan) => {
                        data.actionPlan = JSON.parse(JSON.stringify(actionPlan));
                        
                        return data;
                    });
            });

    }

    static changeMyCard(req) {
        let mObj = {};
        let last4 = '';
        return User.load({_id: req.decoded._id})
        .then((user)=>{
            mObj.user = user;
            return StripeService.createCustomer(req.body);
        })
        .then((customer) => {
            mObj.customer = customer;
            last4 = customer.sources.data[0].last4
            return mObj.user.updateStripeCustomer(customer, mObj.coupon)
        })
        .then(()=>{
                                        
            return activityController.create({ userId: req.decoded._doc._id,
                                        title: 'Updated Account Info', 
                                        type: 'Other',  
                                        notes: mObj.user.businessName + ' changed payment card.'});
        })
        .then(()=>{
            let userObj = mObj.user.safe();
            userObj.last4 = last4;
            return userObj;
        })
        .catch((err) => {
            throw new Error('Failed  Change Credit Card.');
        })
           
    }

    static currentMyCard(req) {
        let mObj = {};
        let last4 = '';
        return User.load({_id: req.decoded._id})
        .then((user)=>{
            mObj.user = user;
            return StripeService.getCustomerById(mObj.user.stripeId)
        })
        .then((customer) => {
            mObj.customer = customer;
            last4 = customer.sources.data[0].last4
            return {last4: last4};
        })
        .catch((err) => {
            throw new Error('Failed.');
        })
           
    }

    static getHelp(req){
        let subject = 'User have a problem' ;
        if(req.body.prefer === 'Call') {
            var mess = 'Call him.';
        } else {
            var mess = 'Write him an email.';
        } 
        let content = `User ${req.body.user_email}.<br>
                        Kind of problem: ${req.body.kind}.<br>
                        <hr>
                        Message: <br>
                        <em>${req.body.message}</em><br><br><hr>
                       ${mess}`;
        return Mailer.send('support@smallbizsilverlining.com', subject, content);
    }
    static changeAvatar(req, res){
        var user = req.decoded;
        if (req.decoded.avatarId && req.file.id != req.decoded.avatarId){
            UserController.deleteOldAvatar(req.decoded.avatarId).then(() => {
                return User.findByIdAndUpdate(req.decoded._id, { avatarId: req.file.id })
            }).then(() => {
                res.send(req.file.id);
                //UserController.getAvatar(req.file, res);
            });
        }
       
        else{
            User.findByIdAndUpdate(req.decoded._id, { avatarId: req.file.id })
            .then(() => {
                res.send(req.file.id);
                //UserController.getAvatar(req.file, res);
            });
        }
    };
    static deleteOldAvatar(id){
        
        return  new Promise((res, rej) => {
            //return new Promise((res, rej) => {
                gfs.remove({ _id: mongoose.Types.ObjectId(id) }, (err) => err ? rej(err) : res());
            //});
            
        });
    }
    static getUserAvatar(req, res){
        var id = req.params.id;
        return gfs.files.findOne({ _id: mongoose.Types.ObjectId(id) }).then((file)=>{
            var rstream = gfs.createReadStream(file.filename);
            var bufs = [];
            rstream.on('data', function (chunk) {
                bufs.push(chunk);
            }).on('error', function () {
                return new Error('Bad data');
            }).on('end', function () { // done
                var fbuf = Buffer.concat(bufs);
                res.contentType(file.contentType);
                res.send(fbuf);
            });
        });
    }
    static getAvatar(file, res){
        
        var rstream = gfs.createReadStream(file.filename);
        var bufs = [];
        rstream.on('data', function (chunk) {
            bufs.push(chunk);
        }).on('error', function () {
            return new Error('Bad data');
        }).on('end', function () { // done
            var fbuf = Buffer.concat(bufs);
            var File = (fbuf.toString('base64'));
            res.send(File);
        });
    }

    static sendSuggestion(req) {
        return Mailer.renderTemplateAndSend('dpcarnage86@gmail.com',
            {email: req.decoded.email, suggestionTypes: req.body.suggestionType, suggestionText: req.body.suggestionText}, 'suggestion');
    }
}

    


module.exports = UserController;