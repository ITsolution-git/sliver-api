const Promise = require('bluebird');
const moment = require('moment');
const CustomError = require('../../../libs/error/CustomError');

class Coupon {

    /**
     * 
     * @param options
     * @returns {Promise}
     */
    static load(options) {
        return this.findOne(options).exec();
    }

    /**
     * List Products
     *
     * @param {Object} options
     * @api private
     */
    static list(options) {
        options = options || {};
        const criteria = options.criteria || {};
        const field = options.field || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .limit(limit)
            .select(field)
            .skip(limit * page)
            .exec();
    }

    /**
     * validation promocode
     * @param code
     * @param planId
     * @returns {Promise|*}
     */
    static isValidCode(code, planId) {
        return this.load({code:code})
            .then((coupon) => {
                if (!coupon) {
                    return Promise.reject(new CustomError('The promo code is invalid', 'BAD_DATA'));
                }

                const errors = coupon.validateSignUp(planId);
                if (errors.length === 0) {
                    return coupon;
                }
                return Promise.reject(errors[0]);
            })
    }

    /**
     * Checks Expiration date
     *
     * @returns {boolean}
     */
    expirationDate() {
        const todayMoment = new moment();
        return todayMoment.isBetween(this.dateFrom, this.dateUntil);
    }

    /**
     * Check applied to plan
     *
     * @param {string} productId
     * @returns {boolean}
     */
    isCheckPlan(productId) {
        return this.plan._id == productId;
    }

    isDurationOneTime() {
        return this.duration === 1;
    }

    /**
     * Coupon can be redeemed
     *
     * @returns {boolean}
     */
    isRedemption() {
        return this.redemption > 0;
    }

    /**
     * Validation coupon at the time of register user
     *
     * @param planId
     * @returns {Array}
     */
    validateSignUp(planId) {
        let errors = [];

        if (!this.expirationDate()) {
            errors.push(new CustomError('The promo code is already expired', 'BAD_DATA'));
        }

        if (this.plan && !this.isCheckPlan(planId)) {
            errors.push(new CustomError('This promo code can\'t be applied for this plan', 'BAD_DATA'));
        }

        if (this.redemption != null && !this.isRedemption()) {
            errors.push(new CustomError('The promo code is invalid', 'BAD_DATA'));
        }


        return errors;
    }

    /**
     * Validation coupon before charges product payments
     * 
     * @param product
     * @returns {boolean}
     */
    validationBeforeCharge(product) {
        if (this.plan && !this.isCheckPlan(product._id) || this.isDurationOneTime()) {
            return false;
        }

        return true;
    }

    /**
     * Reduces redemption coupon at 1
     *
     * @returns {Promise|*}
     */
    minusRedemption() {
        if (this.redemption == null) {
            //noinspection JSValidateTypes
            return;
        }

        this.redemption += -1;
        return this.save();
    }

}

module.exports = Coupon;