const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');

const slapMindset = mongoose.model('slapMindset');
const IdealClient = mongoose.model('IdealClient');
const Statement = mongoose.model('Statement');
const YearGoal = mongoose.model('YearGoal');
const ActionPlan = mongoose.model('ActionPlan');

const stripe = require('../services/stripe');
const StripeService = stripe.service;


let activityController = require('./activityController');
class UserController {
    
    static createUser(req) {
        req.body.firstName = '';
        return (new User(req.body)).save()
        .then(function(user){
            userObj = user.toJSON();
            delete userObj.password;
            delete userObj.stripeId;
            delete userObj.stripeSource;

            return userObj;
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

    static getUser(req) {
        return User.load({_id: req.params.id})
        .then((user) => {
            return user.safe();
        });
    }

    static updateUser(req) {
        var bizName;
        return User.load({_id: req.body._id}).then(function(user){
            bizName = user._doc.businessName;
            return User.findByIdAndUpdate(req.body._id, req.body);
        })
        .then(function(user){
            return User.list({criteria: {businessName: bizName}});
        })
        .then(function(users){
            return Promise.all( users.map(function(user){
                user.businessName = req.body.businessName;
                user.name = req.body.name;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.phone = req.body.phone;
                user.password = req.body.password;
                user.partnerId = req.body.partnerId;
                user.expertId = req.body.expertId;
                user.extrainfo = req.body.extrainfo;
                return user.save();
            }));
        })
        .then(function(users){
            return users.map(user=>{
                return user.safe();
            });
        });
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
                user.businessName = req.body.businessName;
                user.name = req.body.name;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.phone = req.body.phone;
                user.password = req.body.password;
                user.partnerId = req.body.partnerId;
                user.expertId = req.body.expertId;
                user.extrainfo = req.body.extrainfo;
                return user.save();
            }));
        })
        .then(function(responses){
            return activityController.create({ userId: req.decoded._doc._id,
                                        title: 'Updated Account Info', 
                                        type: 'Account',  
                                        notes: bizName + ' set up the payment.'});
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
        return User.load({_id: req.body._id})
        .then(user => {
            user.status = 'deleted';
            return user.save();
        })
        .then(user=>{
            return user.safe();
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
                                        type: 'Account',  
                                        notes: mObj.user.businessName + ' set up the payment.'});
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
    
}

module.exports = UserController;