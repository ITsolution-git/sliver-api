const mongoose = require('../../libs/mongoose');
const User = require('./class/User');
const Moment = require('moment');

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
        // unique : [true, 'should unique'],
        required : true
    },
    phone : {
        type : Number,
        // unique : true,
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
        default: ''
    },
    stripeId : {
        type : String
        // require : true
    },
    stripeSource : {
        type: String
    },
    stripeSubscription : {
        type: String
    },
    stripeBuildSubscription: {
        type: String
    },
    awaitCreationSubscription: {
        type: Boolean
    },
    // No Deprecation and use role
    // admin : {
    //     type : Number,
    //     enum : [0,1],
    //     default : 0
    // },
    
    // User Role model
    // Admin 1 SLAPexpert 2 SLAPmanagers 3 SLAPster 4 Partner 5 TEST 6

    role: {
        type: Number,
        enum: [1,2,3,4,5,6],  
        default: 4  
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
    lastLogin: {
        type: Date,
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
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'inactive', 'confirmed'],
        default: 'active'
    },
    partnerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    expertId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    extrainfo: {
        type: Object,
        default: {
            workPhone: '',
            cellPhone: '',
            contactMethod:'',
            textNotes:'',
        }
    },
    pausingPayment: {
        type: Object,
        default: false,
    },

    confirmationToken : {
        type : String
    },
    confirmationExpirationDate : {
        type : Date
    },
    avatarId:{
        type: String
    },
});

/**
 * Before saving hash password
 */
schema.pre('save', function(next) {
    let _this = this;
    if ((this.isModified('businessName') || this.isModified('email'))
        && (this.role != 4)) {
        return this.constructor.list({criteria: {email: this.email}})
        .then(function(users){
            if (users.length != 0)
                next(new Error('There\'s a user with same email.'));
            else {
                return _this.updatePassword(next);   
            }
        })
    }
    return this.updatePassword(next);   
});

schema.loadClass(User);

module.exports = mongoose.model('User', schema);

const UserModel = mongoose.model('User');