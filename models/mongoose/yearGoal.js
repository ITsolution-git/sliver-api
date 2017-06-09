const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const YearGoal = require('./class/YearGoal');

const schema = new Schema({
    userId: {
        type: String
    },
    personalExpenses: {
        type: Object
    },

    fixedBusinessExpenses: {
        type: Object
    },

    revenueStreams: {
        type: Object
    }
});

schema.loadClass(YearGoal);

module.exports = mongoose.model('YearGoal',schema);