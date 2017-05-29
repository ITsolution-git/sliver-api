const mongoose = require('mongoose');
const Statement = mongoose.model('Statement');
const User = mongoose.model('User');


class StatementController {

    static setYourStatement(req) {        
        return Statement.UpdateOrCreate({userId: req.decoded._doc._id, yourStatement: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }
    
    static setStepOneSummary(req) {
        return Statement.UpdateOrCreate({userId: req.decoded._doc._id, step1Summary: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getYourStatement(req) {
        let options = {
            userId:req.decoded._doc._id,
            select: 'yourStatement'
        };

        return Statement.load(options);
    }

    static getStepOneSummary(req) {
        let options = {
            userId:req.decoded._doc._id,
            select: 'step1Summary'
        };

        return Statement.load(options);
    }
}

module.exports = StatementController;