class Payment {
    
    /**
     * List Payment
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
     * Create payment plan
     * @param plan
     * @param coupon
     * @returns {{coupon: {}}}
     */
    createPlanPayment(plan,coupon) {
        let payment = {};
        payment.productId = plan._id;
        payment.amount = coupon ? plan.applyCoupon(coupon) : plan.costProduct;
        payment.name = plan.productName;
        payment.cost = plan.costProduct;
        this.couponId = coupon ? coupon._id : null;

        return payment;
    }


    createExtraPayment(extra) {
        let payment = {};
        payment.productId = extra._id;
        payment.amount = extra.costProduct;
        payment.name = extra.productName;

        return payment;
    }
    /**
     * Create build first payment
     * @param build
     * @returns {{}}
     */
    createBuildFirstPayment(build) {
        let payment = {};
        payment.productId = build._id;
        payment.amount = build.buildType == 1 ? build.amountFirstPayment : build.costProduct;
        payment.name = build.productName;
        return payment;
    }

    createBuildPayment(build) {
        let payment = {};
        payment.productId = build._id;
        payment.amount = build.costProduct;
        payment.name = build.productName;
        return payment;
    }



    /**
     * Calculate all summ plan cost and build cost
     * @returns {*}
     */
    calculate() {
        let summ = null;
        this.products.forEach((item) => {
            summ += item.amount;
        });

        return summ;
    }

    /**
     * Save payment in table
     * @param mObj
     */
    savePayment(mObj) {
        this.userId = mObj.user._id;
        this.status = mObj.charges.status == 'succeeded' ? 1 : 0;
        this.paymentDate = mObj.charges.created * 1000;
        this.amountCharges = mObj.payments.calculate();
        this.amountSaved = mObj.customer.account_balance;
        this.save();
    }
}

module.exports = Payment;