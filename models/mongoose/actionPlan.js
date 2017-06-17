const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const ActionPlan = require('./class/ActionPlan');

const schema = new Schema({
    userId: {
        type: String
    },
    worldAroundYou: {
        type: Object
    },
    whatsHappening: {
        type: Array
    },
    rateConnectingStrategies: {
        type: Array
    }
});

schema.loadClass(ActionPlan);

module.exports = mongoose.model('ActionPlan',schema);