const mongoose = require('./../libs/mongoose');
const ActionPlan = mongoose.model('ActionPlan');
const User = mongoose.model('User');

class ActionPlanController {

    static setWorldAroundYou(req) {
        return ActionPlan.UpdateOrCreate({userId: req.decoded._doc._id, worldAroundYou: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getWorldAroundYou(req) {
        return ActionPlan.load({userId: req.decoded._doc._id, select: 'worldAroundYou'});
    }



    static setWhatsHappening(req) {
        return ActionPlan.UpdateOrCreate({userId: req.decoded._doc._id, whatsHappening: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getWhatsHappening(req) {
        return ActionPlan.load({userId: req.decoded._doc._id, select: 'whatsHappening'});
    }

    static setRateConnectingStrategies(req) {
        return ActionPlan.UpdateOrCreate({userId: req.decoded._doc._id, rateConnectingStrategies: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getRateConnectingStrategies(req) {
        return ActionPlan.load({userId: req.decoded._doc._id, select: 'rateConnectingStrategies'});
    }
    

}

module.exports = ActionPlanController;