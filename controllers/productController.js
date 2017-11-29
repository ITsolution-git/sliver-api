const mongoose = require('./../libs/mongoose');
const Product = mongoose.model('Product');
const stripe = require('../services/stripe');
const StripeService = stripe.service;
class ProductController {

    static create(req) {

        return (new Product(req.body)).save().then((product) => {
            if(product.typeProduct !== 2){
                return StripeService.createPlan(product).then(() => {
                    return product;
                });
            }
            else return product;
        });
    }

    static getProducts() {
        return Product.list();
    }

    static getProduct(req) {
        return Product.load({_id: req.params.id});
    }

    static updateProduct(req) {
        return Product.findByIdAndUpdate(req.query._id, req.query);
    }

    static deleteProduct(req) {
        return Product.findByIdAndRemove({ _id: req.params.id }).then(product => {
            if (product.typeProduct !== 2)
                return StripeService.deletePlan(product.productName).then(() => {
                    return product;
            })
            else return product;
        });
    }

    static getPlans() {
        let options = {
            limit: 6,
            criteria: {
                status: Product.ACTIVE,
                typeProduct: Product.TYPE_PLAN
            }
        };

        return Product.list(options);
    }
    static getAllPlansForCoupons() {
        let options = {
            //limit: 6,
            criteria: {
                status: Product.ACTIVE,
                $or: [
                    { typeProduct: Product.TYPE_BUILD, buildType: Product.BUILD_INSTALLMENTS },
                    { typeProduct: Product.TYPE_PLAN }
                ]

            }
        };
        console.log({ typeProduct: Product.TYPE_BUILD, buildType: Product.BUILD_INSTALLMENTS })
        return Product.list(options).then(products => {
            return products
        });
    }

    static getAll() {

        let options = {
            criteria: {
                status: Product.ACTIVE
            }
        };

        return Product.list(options);
    }

    static getBuilds() {
        return new Promise((resolve, reject) => {
            let result = [];
        
            Product.findOne({
                buildType: Product.BUILD_ONETIME,
                status: Product.ACTIVE,
                typeProduct: Product.TYPE_BUILD
            })
            .then((response) => {
                if (response) {
                    result.push(response);
                }
        
                return Product.findOne({
                    buildType: Product.BUILD_INSTALLMENTS,
                    status: Product.ACTIVE,
                    typeProduct: Product.TYPE_BUILD
                });
            })
            .then((response) => {
                if (response) {
                    result.push(response);
                }
                // builds.oneTime = response;
                resolve(result);
            })
            .catch((err) => {
                return reject(err);
            });
        
        });
    }

}

module.exports = ProductController;