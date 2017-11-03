let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
const PartnerReport = require('./class/PartnerReport');

let schema = new Schema({
    partnerId: {
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
    totalIncome: {
        type: Number,
    },
    
});

schema.loadClass(PartnerReport);

module.exports = mongoose.model('PartnerReport', schema);