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
    // No Deprecation and use role
    // admin : {
    //     type : Number,
    //     enum : [0,1],
    //     default : 0
    // },
    
    // User Role model
    // Admin 1 SLAPexpert 2 SLAPmanagers 3 SLAPster 4 Partner 5

    role: {
        type: Number,
        enum: [1,2,3,4,5],  
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
        enum: ['active', 'deleted', 'inactive', 'confirmed'],
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
    }
});

/**
 * Before saving hash password
 */
schema.pre('save', function(next) {
    if(this.password) {
        this.password = HashPass.createHash(this.password);
        return next();
    } else {
        return UserModel.load({_id: this._id}).then(user=>{
            this.password = user.password;
            return next();
        })
    }
        
});

schema.loadClass(User);

module.exports = mongoose.model('User', schema);

const UserModel = mongoose.model('User');