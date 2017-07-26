const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const Statement = mongoose.model('Statement');


class ExcuteController {

    static setFinishBuild(req) {
        return User.UpdateOrCreate({userId: req.decoded._doc._id, finishedSteps: req.body.finishedSteps}); 
    }

}

module.exports = ExcuteController;