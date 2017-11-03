const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const Partner = require('./class/Partner');

const schema = new Schema({
    businessName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    additional_email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    revenue_percent: {
        type: String,
        required: true
    },
    partnership_overview: {
        type: String,
        required: true
    }, 
    promocode: {
        type: String,
        required: true
    },
    snapshot: {
        type: String,
        enum: ['Weekly', 'Monthly', 'Quarterly'],  
    }
});

schema.loadClass(Partner);

module.exports = mongoose.model('Partner', schema);