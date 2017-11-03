let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
const ExpertReport = require('./class/ExpertReport');

let schema = new Schema({
    expertId: {
        type: String,
        required: 'Name is not empty',
    },
    from : {
        type: Date,
        required: 'From is required'
    },
    to: {
        type: Date,
        required: 'To is required'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    countAssignedUsers: {
        type: Number,
    },
    countAssignedUsersByPlan: {
        type: Object,
    },
    totalHours: {
        type: Number,
    },
    totalMissedMeetings: {
        type: Number,
    }
});

schema.loadClass(ExpertReport);

module.exports = mongoose.model('ExpertReport', schema);

