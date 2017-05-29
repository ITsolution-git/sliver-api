const mongoose = require('./../libs/mongoose');
const IdealClient = mongoose.model('IdealClient');
const User = mongoose.model('User');

class IdealClientController {

    static setNameIdealClient(req) {
        return IdealClient.UpdateOrCreate({userId: req.decoded._doc._id, nameYourIdealClient: req.body.data})
            .then(() => {
                return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps});
            });
    }

    static getNameIdealClient(req) {
        let options = {
            userId: req.decoded._doc._id,
            select: 'nameYouIdealClient'
        };

        return IdealClient.load(options);
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