const mongoose = require('mongoose');
const ExcuteItem = mongoose.model('ExcuteItem');

class ExcuteItemController {
    
    static create(req) {
        
        let excuteItem = req.body;
        // if(ExcuteItem.dateFrom) {
        //     ExcuteItem.dateFrom = new Date(ExcuteItem.dateFrom);
        // }
        
        // if(ExcuteItem.dateUntil) {
        //     ExcuteItem.dateUntil = new Date(ExcuteItem.dateUntil);
        // }
        
        return (new ExcuteItem(excuteItem)).save();
    }

    static getExcuteItems() {
        return ExcuteItem.list();
    }



    static getExcuteItem(req) {
       return ExcuteItem.load({_id: req.params.id});
    }

    static update(req) {
       return ExcuteItem.findOneAndUpdate(req.body);
    }

    static remove(req) {
        return ExcuteItem.findOneAndRemove(req.body);
    }
    
}

module.exports = ExcuteItemController;