const CustomError = require('../libs/error/CustomError');
const StripeError = require('../services/stripe/errors/StripeError');
const Mailer = require('../libs/class/Mailer');
const config = require('../config');
const stripe = require('../services/stripe');
const jwt = require('jsonwebtoken');
const StripeService = stripe.service;

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Coupon = mongoose.model('Coupon');
const Payment = mongoose.model('Payment');

/**
 * @swagger
 * securityDefinitions:
 *   api_key:
 *     type: "apiKey"
 *     name: "Authorization"
 *     vlaue: "Authorization"
 *     in: "header"    
 * definitions:
 *   LoginUser:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: email
 *         example: "admin@admin.loc"
 *       password:
 *         type: string
 *         example: "password"
 *   NewUser:
 *     type: object
 *     required:
 *       - email
 *       - lastName
 *       - businessName
 *       - phone
 *       - email
 *       - password
 *       - confirmPassword
 *       - billingAddress
 *       - planId
 *     properties:
 *       name:
 *         type: string
 *         example: "John"
 *       lastName:
 *         type: string
 *         example: "Doe"
 *       businessName:
 *         type: string
 *         example: "Fashion clothing"
 *       phone:
 *         type: string
 *         example: "123456789"
 *       email:
 *         type: string
 *         format: email
 *       password:
 *         type: string
 *         example: "password"
 *       confirmPassword:
 *         type: string
 *         example: "password"
 *       billingAddress:
 *         type: string
 *         example: "23 West Av."
 *       planId:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 *       code:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 *       buildId:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 *   User:
 *     type: object
 *     required:
 *       - email
 *       - lastName
 *       - businessName
 *       - phone
 *       - email
 *       - password
 *       - confirmPassword
 *       - billingAddress
 *       - planId
 *     properties:
 *       name:
 *         type: string
 *         example: "John"
 *       lastName:
 *         type: string
 *         example: "Doe"
 *       businessName:
 *         type: string
 *         example: "Fashion clothing"
 *       phone:
 *         type: string
 *         example: "123456789"
 *       email:
 *         type: string
 *         format: email
 *       password:
 *         type: string
 *         example: "password"
 *       confirmPassword:
 *         type: string
 *         example: "password"
 *       billingAddress:
 *         type: string
 *         example: "23 West Av."
 *       planId:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 *       code:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 *       buildId:
 *         type: string
 *         example: "575d0c22964ddb3b6ba41bed"
 */

class AuthController {

    /**
     * @swagger
     * v1/auth/:
     *  post:
     *    description: Sign in  user
     *    tags:
     *       - v1
     *    produces:
     *      - application/json
     *    parameters:
     *      - in: "body"
     *        name: "body"
     *        description: "SignInUser"
     *        required: true
     *        schema:
     *          $ref: "#/definitions/LoginUser"
     *    responses:
     *      200:
     *        description: Returns token on success
     *        schema:
     *          type: object
     *          properties:
     *            token:
     *              type: string
     *        examples:
     *          token: string
     */
    static signin(req) {
        return User.load({email: req.body.email}).then((user) => {
            if (!user.comparePassword(req.body.password)) {
                throw new CustomError('Whoops, your password are incorrect', 'UNAUTH');
            }

            let token = jwt.sign(user._id, config.secret, {
                expiresIn: "300d" // expires in 24 hours
            });

            return {token: token};
        });
    }

    /**
     * @swagger
     * v1/auth/signup:
     *  post:
     *    description: Sign up a user
     *    tags:
     *       - v1
     *    produces:
     *      - application/json
     *    parameters:
     *      - in: "body"
     *        name: "body"
     *        description: "SignUpUser"
     *        required: true
     *        schema:
     *          $ref: "#/definitions/NewUser"
     *    responses:
     *      200:
     *        description: Returns token on success
     *        schema:
     *          type: object
     *          properties:
     *            token:
     *              type: string
     *        examples:
     *          token: string
     */
    static signup(req) {
        let mObj = {payments: new Payment()};
        return (new User(req.body)).save()
            .then((user) => {
                mObj.user = user;
                console.log(user);
                return Product.load({_id: req.body.planId});
            })
            .then((plan) => {
                mObj.plan = plan;

                if (req.body.code) {
                    return new Promise((resolve) => {
                        Coupon.isValidCode(req.body.code, plan._id)
                            .then(resolve)
                            .catch((err) => {
                                console.log(err); // TODO: winston logger add;
                                resolve();
                            });
                    });
                }
            })
            .then((coupon) => {
                if (coupon) {
                    mObj.coupon = coupon;
                }

                return mObj.payments.createPlanPayment(mObj.plan, coupon);
            })
            .then((payment) => {
                mObj.payments.products.push(payment);

                return Product.load({_id: req.body.buildId});
            })
            .then((build) => {
                if (build) {
                    mObj.payments.products.push(mObj.payments.createBuildFirstPayment(build));
                }

                return StripeService.createCustomer(req.body);
            })
            .then((customer) => {
                mObj.customer = customer;

                return mObj.user.updateStripeCustomer(customer, mObj.coupon)
            })
            .then(() => {
                return StripeService.createCharges(mObj.customer, mObj.payments.calculate());
            })
            .then((charges) => {
                mObj.charges = charges;

                return StripeService.getCustomerById(mObj.customer.id);
            })
            .then((customer) => {
                mObj.customer = customer;
                return mObj.payments.savePayment(mObj);
            })
            .then(() => {
                if (mObj.coupon) {
                    mObj.coupon.minusRedemption();
                }

                return mObj.user;
            })
            .catch((err) => {
                if (err instanceof StripeError) {
                    return mObj.user.remove().then(() => {
                        return err;
                    })
                }

                return err;
            });
    }

    /**
     * @swagger
     * /admin/auth/:
     *  post:
     *    description: Sign in admin user
     *    tags:
     *       - admin
     *    produces:
     *      - application/json
     *    parameters:
     *      - name: email
     *        description: email
     *        in:  body
     *        required: true
     *        type: string
     *      - name: password
     *        description: password
     *        in:  body
     *        required: true
     *        type: string
     *    responses:
     *      200:
     *        description: Returns token on success
     *        schema:
     *          type: object
     *          properties:
     *            token:
     *              type: string
     *        examples:
     *          token: string
     */
    static signinAdmin(req) {
        return User.load({email: req.body.email})
            .then((user) => {
                if (!user.comparePassword(req.body.password) && !user.isAdmin()) {
                    throw new CustomError('Whoops, your password are incorrect', 'UNAUTH');
                }

                let token = jwt.sign(user, config.secret, {
                    expiresIn: "24h" // expires in 24 hours
                });

                return {token: token};
            })
    }

    static sendToken(req) {
        return User.load({email: req.query.email})
            .then((user) => {
                if (!user) throw new CustomError('User not found', 'NOT_FOUND');

                return user.createToken();
            })
            .then((user) => {
                let subject = 'SLAPCenter Password Reset';
                let content = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n'
                    + config.host + '#/reset/' + user.token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n';

                return Mailer.send(user.email, subject, content);
            })
            .then((result) => {
                if (!result) throw new CustomError('Not send mail!', 'SERVICE_UNAVAILABLE');

                return new CustomError('Letter email was sent! Run to your inbox to check it out', 'OK', {orig: result});
            });
    }
    
    /**
     * @swagger
     * v1/auth/:
     *  get:
     *    description: Get token
     *    tags:
     *       - v1
     *    produces:
     *      - application/json
     *    responses:
     *      200:
     *        description: Success
     *        schema:
     *          type: object
     *          properties:
     *            token:
     *              type: "#/definitions/User"
     *        examples:
     *          token: string
     */
    static authToken(req) {
        return new Promise((resolve) => {
            resolve(req.decoded._doc);
        });
    }

    static checkPassword(req) {
        let mUser = null;

        return User.load({token: req.body['access-token']})
            .then((user) => {
                if (!user) throw new CustomError('Failed to authenticate token.', 'NOT_FOUND');
                mUser = user;

                return user.expDate();
            })
            .then((result) => {
                if (!result) throw new CustomError('Failed to authenticate token.', 'BAD_DATA');

                return mUser.resetPassword(req.body['new_password']);
            });
    }

}

module.exports = AuthController;