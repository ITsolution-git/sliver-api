const mongoose = require('mongoose');
const ExcuteItem = mongoose.model('ExcuteItem');

let activityController = require('./activityController');
class ExcuteItemController {
    
    static create(req) {
        var con = {
            action: { name:'ActionItem'},
            reflextion: { name:'Pause & Reflect'} ,
            sales: { name:'Sales'} 
        }
        let excuteItem = req.body;
        excuteItem.userId = req.decoded._doc._id;

        // if(ExcuteItem.dateFrom) {
        //     ExcuteItem.dateFrom = new Date(ExcuteItem.dateFrom);
        // }
        
        // if(ExcuteItem.dateUntil) {
        //     ExcuteItem.dateUntil = new Date(ExcuteItem.dateUntil);
        // }
        
        return (new ExcuteItem(excuteItem)).save().then(resp => {
            return activityController.create({ 
                userId: req.decoded._doc._id,
                title: 'Create a ' + con[excuteItem.type].name, 
                type: con[excuteItem.type].name,
                notes: req.decoded._doc.businessName + ' created a ' + con[excuteItem.type].name});
        });
    }

    static getExcuteItems(req) {
        return ExcuteItem.list({criteria:{userId: req.decoded._doc._id}});
    }

    static getExcuteItemsByUser(req) {
        return ExcuteItem.list({criteria:{userId: req.params.user_id}});
    }
    

    static getExcuteItem(req) {
       return ExcuteItem.load({_id: req.params.id});
    }

    static update(req) {
        var con = {
            action: { name:'ActionItem'},
            reflextion: { name:'Reflection'} ,
            sales: { name:'SalesItem'} 
        }
       return ExcuteItem.findOneAndUpdate(req.body).then(resp => {
           if (req.body.progress == 100)
                return activityController.create({ 
                        userId: req.decoded._doc._id,
                        title: 'Update a ' + con[req.body.type].name, 
                        type: con[req.body.type].name,
                        notes: req.decoded._doc.businessName + ' updated a ' + con[req.body.type].name});

            else 

                return activityController.create({ 
                        userId: req.decoded._doc._id,
                        title: 'Complete a ' + con[req.body.type].name, 
                        type: con[req.body.type].name,
                        notes: req.decoded._doc.businessName + ' completed a ' + con[req.body.type].name});
       });
    }

    static remove(req) {
        return ExcuteItem.findOneAndRemove(req.body);
        //TODO add message just like add & update

    }
    
}

module.exports = ExcuteItemController;