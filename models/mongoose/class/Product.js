class Product {

    /**
     * List Products
     *
     * @param {Object} options
     * @api private
     */
    static list(options) {
        options = options || {};
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;

        return this.find(criteria)
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    /**
     * Find one product by criteria
     * @param criteria
     * @returns {Promise}
     */
    static load(criteria) {
        return this.findOne(criteria).exec();
    }

    /**
     * Coupon application if available
     *
     * @param coupon
     * @returns {number}
     */
    applyCoupon(coupon) {
        return this.amount = coupon.typeCoupon ? this.costProduct - (this.costProduct * coupon.amount) / 100 : this.costProduct - coupon.amount; //TODO: const typeCoupon
    }
}

module.exports = Product;