let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
const PartnerReport = require('./class/PartnerReport');

let schema = new Schema({
    partnerId: {
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
    totalIncome: {
        type: Number,
    },
    totalShareToPartner: {
        type: Number,
    }
    
});

schema.loadClass(PartnerReport);

module.exports = mongoose.model('PartnerReport', schema);