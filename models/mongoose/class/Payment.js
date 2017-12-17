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
        // payment.couponId = coupon ? coupon._id : null;

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
    createBuildFirstPayment(build, coupon) {
        let payment = {};
        payment.productId = build._id;
        if (coupon.slapBuild.plan) {
            if (build.buildType == 2)
            {
                if (coupon.slapBuild.typeCoupon == 1) 
                    payment.amount = build.costProduct - build.costProduct * coupon.slapBuild.amount / 100;
                else
                    payment.amount = build.costProduct - coupon.slapBuild.amount;
            }    
            else
                payment.amount = build.amountFirstPayment;
        }
        else 
        {
            payment.amount = build.buildType == 1 ? build.amountFirstPayment : build.costProduct;
        }    
        payment.name = build.productName;
        return payment;
    }

    createBuildPayment(build, coupon) {
        let payment = {};
        payment.productId = build._id;
        if (coupon.slapBuild.plan) {
            //this coupon was already meant to be applied to slapbuild the buildtype of which is 1
            if (coupon.slapBuild.typeCoupon == 1) 
                payment.amount = build.costProduct - build.costProduct * coupon.slapBuild.amount / 100;
            else
                payment.amount = build.costProduct - coupon.slapBuild.amount;
        }
        else {
            payment.amount = build.costProduct;
        }
        payment.name = build.productName;
        this.couponId = coupon ? coupon._id : null;
        return payment;
    }



    /**
     * Calculate all summ plan cost and build cost
     * @returns {*}
     */
    calculate() {
        let summ = 0;
        this.products.forEach((item) => {
            summ += item.amount;
        });
        console.log(JSON.stringify(this.products));
        console.log("calculate: " + summ);

        return summ;
    }

    /**
     * Generate the all plan names and build names
     * @return {*}
     */
    generateNameForCharge(coupon) {
        let name = "";
        this.products.forEach((item) => {
            let _name = item.name;
            if (item.name == "One time SLAP") {
                _name = "SLAPbuild One Time Payment"
                let discount = "";
                if (coupon.slapBuild.typeCoupon != null) {
                    if (coupon.slapBuild.typeCoupon == 1) 
                        discount = coupon.slapBuild.amount + "%"
                    else
                        discount = "$" + coupon.slapBuild.amount
                    _name += ": " + discount + " off promo code applied "
                }
            }
            name += _name + ",";
        })
        name = name.substring(0, name.length-1);
        console.log("name: " + name);
        return name;
    }
    /**
     * Save payment in table
     * @param mObj
     */
    savePayment(mObj) {
        this.userId = mObj.user._id;
        this.status = mObj.charges ? 1 : 0;
        this.paymentDate = mObj.charges ? mObj.charges.created * 1000 : null;
        this.amountCharges = mObj.charges ? mObj.charges.amount / 100 : this.calculate();
        this.amountSaved = mObj.customer.account_balance;
        this.save();
    }
}

module.exports = Payment;