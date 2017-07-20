const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');

class ActivityController {
    
    static create(req) {
        
        let activity = req.body ? req.body : req;
        activity.updatedBy = req.decoded ? req.decoded._doc._id : null;
        return (new Activity(activity)).save();
    }

    static getActivitys(req) {
        return Activity.list({criteria: {userId: req.params.user_id}});
    }

    static getActivity(req) {
       return Activity.load({_id: req.params.id});
    }

    static update(req) {
       return Activity.findOnqeAndUpdate(req.body);
    }

    static remove(req) {
        return Activity.findOneAndRemove(req.body);
    }
}

module.exports = ActivityController;