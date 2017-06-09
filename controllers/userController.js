const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const slapMindset = mongoose.model('slapMindset');
const IdealClient = mongoose.model('IdealClient');
const Statement = mongoose.model('Statement');
const YearGoal = mongoose.model('YearGoal');

class UserController {
    static getFinishedSteps(req) {
        let select = 'finishedSteps';
        let userId = req.decoded._doc._id;
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
                        if (yearGoal.revenueStreams) { 
                            data.yearGoal.sellingPrice = yearGoal.revenueStreams;
                            data.yearGoal.variableBusinessExpenses = yearGoal.revenueStreams;
                            data.yearGoal.profitMargin = yearGoal.revenueStreams;
                            data.yearGoal.revenueBreakdown = yearGoal.revenueStreams;
                            data.yearGoal.yourYearGoal = yearGoal.revenueStreams;
                            data.yearGoal.adjustYourYearGoal = yearGoal.revenueStreams;
                            
                            data.yearGoal.commitYourYearGoal = yearGoal.revenueStreams;
                        }
                        return data;
                    });
            });

    }
}

module.exports = UserController;