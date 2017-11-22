const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const Partner = require('./class/Partner');

const schema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
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
    additional_email: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: true
    },
    revenue_percent: {
        type: Number,
        required: true
    },
    partnership_overview: {
        type: String,
        required: false
    }, 
    promocode: {
        type: Array,
        required: false
    },
    snapshot: {
        type: String,
        enum: ['Weekly', 'Monthly', 'Quarterly'],  
    }
});

schema.loadClass(Partner);

module.exports = mongoose.model('Partner', schema);