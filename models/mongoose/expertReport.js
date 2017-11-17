let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
const ExpertReport = require('./class/ExpertReport');

let schema = new Schema({
    expertId: {
        type: String,
        required: 'Name is not empty',
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    assignedUsers: {
        type: Array,
    },
    assignedUsersByPlan: {
        type: Object,
    },
});

schema.loadClass(ExpertReport);

module.exports = mongoose.model('ExpertReport', schema);

