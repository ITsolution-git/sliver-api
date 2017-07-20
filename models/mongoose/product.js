const mongoose = require('../../libs/mongoose');
const Schema = mongoose.Schema;

const Product = require('./class/Product');

let schema = new Schema({
    productName : {
        type : String,
        required : true
    },
    productDescription : {
        type : String,
        required : true
    },
    costProduct : {
        type : Number,
        require : true
    },
    billingFrequency : {
        type : Number,
        require : true
    },
    expertHours : {
        type : Number,
        require : true,
        default : 0
    },
    amountFirstPayment : {
        type: Number,
        require : true,
        default : 0
    },
    costMonth : {
        type : Number
    },
    createdAt : {
        type: Date,
        default: Date.now()
    },
    typeProduct : {
        type: Number
    },
    status : {
      type: Number  
    },
    buildType : {
        type: Number
    }
});

schema.loadClass(Product);

const ProductModel = mongoose.model('Product', schema);

ProductModel.TYPE_PLAN = 1;
ProductModel.TYPE_BUILD = 2;
ProductModel.TYPE_EXTRA = 2;

ProductModel.ACTIVE = 1;
ProductModel.INACTIVE = 0;

ProductModel.BUILD_INSTALLMENTS = 1;
ProductModel.BUILD_ONETIME = 2;

module.exports = ProductModel;
