const Payment = require('./class/Payment');

const mongoose = require('../../libs/mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    userId : {
        type: String,
        require: true
    },
    products : {
        type: Array
        // require: true
    },
    paymentDate : {
        type: Date,
        default : Date.now()
    },
    couponId : {
        type: String
    },
    amountCharges: {
        type: Number
    },
    amountSaved: {
        type: Number
    },
    status : {
        type: Number,
        enum: [0,1],
        default: 0
    }
});

schema.loadClass(Payment);

module.exports = mongoose.model('Payment',schema);