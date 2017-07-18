const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');

const slapMindset = mongoose.model('slapMindset');
const IdealClient = mongoose.model('IdealClient');
const Statement = mongoose.model('Statement');
const YearGoal = mongoose.model('YearGoal');
const ActionPlan = mongoose.model('ActionPlan');

class UserController {
    
    static createUser(req) {
        req.body.firstName = '';
        return (new User(req.body)).save().catch(function(err){
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
        return User.list();
    }

    static getUser(req) {
        return User.load({_id: req.params.id});
    }

    static updateUser(req) {
        return User.findByIdAndUpdate(req.query._id, req.query);
    }

    static deleteUser(req) {
        // return User.findByIdAndRemove({_id: req.params.id});
        req.body.status = 'deleted';
        return User.findByIdAndUpdate(req.query._id, req.query);
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
}

module.exports = UserController;