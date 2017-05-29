const mongoose = require('../../libs/mongoose');
const User = require('./class/User');

const HashPass = require('../../libs/class/HashPass');

let Schema = mongoose.Schema;

let schema = new Schema({
    name : {
         type : String,
         required : true
     },
    lastName : {
        type : String,
        required : true
    },
    businessName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    phone : {
        type : Number,
        unique : true,
        required : true
    },
    password : {
        type : String,
        require : true
    },    
    token : {
        type : String
    },
    expirationDate : {
        type : Date
    },
    billingAddress : {
        type : String,
        required : true
    },
    stripeId : {
        type : String
        // require : true
    },
    stripeSource : {
        type: String
    },
    admin : {
        type : Number,
        enum : [0,1],
        default : 1
    },
    planId : {
        type: String
    },
    plan_date: {
        type: Date,
        default: null
    },
    buildId : {
        type : String
    },
    build_date: {
        type: Date,
        default: null
    },
    couponId : {
        type: String,
        default:null
    },
    createdAt : {
        type: Date,
        default: new Date()
    },
    finishedSteps: {
        type: Array,
        default: []
    }


});

/**
 * Before saving hash password
 */
schema.pre('save', function(next) {
    this.password = HashPass.createHash(this.password);
    return next();
});

schema.loadClass(User);

module.exports = mongoose.model('User', schema);
