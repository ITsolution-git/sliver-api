const mongoose = require('./../libs/mongoose');
const YearGoal = mongoose.model('YearGoal');
const User = mongoose.model('User');

class YearGoalController {

    static setPersonalExpenses(req) {
        return YearGoal.UpdateOrCreate({userId: req.decoded._doc._id, personalExpenses: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getPersonalExpenses(req) {
        return YearGoal.load({userId: req.decoded._doc._id, select: 'personalExpenses'});
    }

    static setFixedBusinessExpenses(req) {
        return YearGoal.UpdateOrCreate({userId: req.decoded._doc._id, fixedBusinessExpenses: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getFixedBusinessExpenses(req) {
        return YearGoal.load({userId: req.decoded._doc._id, select: 'fixedBusinessExpenses'});
    }


    static setRevenueStreams(req) {
        return YearGoal.UpdateOrCreate({userId: req.decoded._doc._id, revenueStreams: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getRevenueStreams(req) {
        return YearGoal.load({userId: req.decoded._doc._id, select: 'revenueStreams'});
    }
}

module.exports = YearGoalController;