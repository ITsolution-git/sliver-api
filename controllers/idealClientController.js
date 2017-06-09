const mongoose = require('./../libs/mongoose');
const IdealClient = mongoose.model('IdealClient');
const User = mongoose.model('User');
const Statement = mongoose.model('Statement');


class IdealClientController {

    static setNameIdealClient(req) {
   
        let options = {
            userId:req.decoded._doc._id,
            select: 'yourStatement'
        };

        return Statement.load(options).then(yourStatement => {
            yourStatement.yourStatement.fourth = req.body.data.fourth;

            return Statement.UpdateOrCreate({userId: req.decoded._doc._id, yourStatement: yourStatement.yourStatement})
                .then(() => {
                    return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
                });
        });
    }

    static getNameIdealClient(req) {
        let options = {
            userId:req.decoded._doc._id,
            select: 'yourStatement'
        };

        return Statement.load(options).then(yourStatement => {
            return yourStatement.yourStatement.fourth;
        });
    }

    static setWhoAreYouIdealClient(req) {
        return IdealClient.UpdateOrCreate({userId: req.decoded._doc._id, whoAreYouIdealClient: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getWhoAreYouIdealClient(req) {
        let options = {
            userId: req.decoded._doc._id,
            select: 'whoAreYouIdealClient'
        };

        return IdealClient.load(options);
    }

}

module.exports = IdealClientController;