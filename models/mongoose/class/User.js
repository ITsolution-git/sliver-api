const mongoose = require('./../../../libs/mongoose');
const Product = mongoose.model('Product');
const HashPass = require('../../../libs/class/HashPass');
const moment = require('moment');
class User extends mongoose.Model {

    static load(criteria, select) {
        return this.findOne(criteria).select(select).exec();
    }

    static list(options) {
        options = options || {};
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || {};

        return this.find(criteria)
        // .limit(limit)
        // .skip(limit * page)
            .exec();
    }

    static  UpdateOrCreate(obj) {
        return this.update({_id: obj.userId}, obj, {upsert: true, setDefaultsOnInsert: true});
    }

    /**
     * Update customer data stripeAPI
     * @param {Object} customer
     * @param {Object} coupon
     * */
    updateStripeCustomer(customer, coupon) {
        return this.update({
            $set: {
                stripeId: customer.id,
                stripeSource: customer.default_source,
                couponId: coupon ? coupon._id : null
            }
        });
    }

    isAdmin(){

        return this.role === 1;
    }

    /**
     * Checks compare password user
     * @param {string} password
     * @returns {boolean}
     */
    comparePassword(password) {
        return HashPass.validateHash(this.password, password);
    }

    /**
     * Create token and save user
     * @returns {Promise|*}
     */
    createToken() {
        let token = HashPass.createHash(this.email);
        let expirationDate = new Date() + 360000;
        let _this = this;
        return this.getSameBiz()
        .then(business => {
            return Promise.all( business.map(biz=>{
                biz.token = token;
                biz.expirationDate = expirationDate;
                return biz.save();
            }));
        })
        .then(biz => {
            return this.constructor.load({_id: _this._id});
        });
    }

    getSameBiz() {
        return this.constructor.list({criteria: {businessName: this.businessName}});
    }
    /**
     * Date verification
     * @returns {*}
     */
    expDate() {
        let now = new moment();
        return now.isSameOrBefore(new Date(), 'minute');
    }

    /**
     * Reset password and nullable token and date
     * @param password
     * @returns {Promise|*}
     */
    resetPassword(password) {
        let _this = this;
        return this.getSameBiz()
        .then(business => {
            return Promise.all( business.map(biz=>{
                biz.password = password;
                biz.token = null;
                biz.expirationDate = null;
                return biz.save();
            }));
        }).then(biz => {
            return this.constructor.load({_id: _this._id});
        });
    }

    /**
     * Disactive profuct wich frequency finished
     * @param product
     * @returns {Promise|*}
     */
    disactiveProduct(product) {
        if (product.typeProduct == 1) {
            this.planId = null;
            this.plan_date = null;
            return this.save();
        }
        this.buildId = null;
        this.build_date = null;
        return this.save();
    }

    safe() {
        let userObj = this.toJSON();
        delete userObj.password;
        delete userObj.stripeId;
        delete userObj.stripeSource;

        return userObj;
    }
}

module.exports = User;