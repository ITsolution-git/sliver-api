let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
let Coupon = require('./class/Coupon');

let schema = new Schema({
    name: {
        type: String,
        required: 'Name is not empty',
        minlength: [4, 'Name is min {MINLENGTH} letters']
    },
    code: {
        type: String,
        required: 'Code is not empty'
    },
    typeCoupon: {
        type: Number
    },
    amount: {
        type: Number,
        required: 'Amount promo code is not empty'
    },
    plan: {
        type: Object,
        default: null
    },
    redemption: {
        type: Number,
        default: null
    },
    dateFrom: {
        type: Date
    },
    dateUntil: {
        type: Date
    },
    duration: {
        type: Number
    },
    durationLimited: {
        type: Number
    }
});

schema.loadClass(Coupon);

module.exports = mongoose.model('Coupon', schema);