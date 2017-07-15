const mongoose = require('./../../../libs/mongoose');
const Product = mongoose.model('Product');
const HashPass = require('../../../libs/class/HashPass');
const moment = require('moment');

class User {

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
        this.token = HashPass.createHash(this.email);
        this.expirationDate = new Date() + 360000;
        return this.save();
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
        this.password = HashPass.createHash(password);
        this.token = null;
        this.expirationDate = null;
        return this.save();
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
}

module.exports = User;