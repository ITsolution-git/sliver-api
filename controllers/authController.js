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

let userController = require('./userController');
let idealClientController = require('./idealClientController');
let activityController = require('./activityController');
let statementController = require('./statementController');
const IdealClient = mongoose.model('IdealClient');
const Statement = mongoose.model('Statement');
const SlapMindset = mongoose.model('slapMindset');
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
    constructor() {
        // this.signUpSaveUser = signUpSaveUser;
    }
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
            if(!user){
                throw new CustomError('Whoops, your email is wrong.', 'UNAUTH');
            }

            if (!user.comparePassword(req.body.password)) {
                throw new CustomError('Whoops, your password are incorrect', 'UNAUTH');
            }

            let token = jwt.sign({_id: user._id}, config.secret, {
                expiresIn: "300d" // expires in 24 hours
            });

            return {token: token};
        }).catch(err=>{
            throw err;
        });

    }

    static selectSLAPyear(req) {

        return User.load({_id: req.params.id}).then((user) => {
 
            let token = jwt.sign({_id: user._id}, config.secret, {
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
        return AuthController.signUpSaveUser(req)
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
                if (req.body.isRenew)
                    return StripeService.getCustomerById(mObj.user.stripeId)
                    .then((customer) => {
                        mObj.customer = customer;
                    });
                else
                    return StripeService.createCustomer(req.body)
                    .then((customer) => {
                        mObj.customer = customer;

                        return mObj.user.updateStripeCustomer(customer, mObj.coupon)
                    });
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

                if(mObj.user.isRenew) {
                    activityController.create({ userId: mObj.user._id,
                                                title: 'Auto Email Sent', 
                                                type: 'Communication',  
                                                notes: mObj.user.businessName + ' renewed an account with ' + mObj.plan.productName + '.',
                                                journey: {section: 'start', name: 'Account Created'}});

                    return Mailer.renderTemplateAndSend(mObj.user.email, {user: mObj.user.toJSON(), isRenew: true }, 'welcome-slapster')
                    .then(res=>{
                        return activityController.create({ userId: mObj.user._id,
                                                title: 'Account Renewed', 
                                                type: 'Milestone',  
                                                notes: mObj.user.businessName + ' renewed an account with ' + mObj.plan.productName + '.'});
                    });
                } else {
                    activityController.create({ userId: mObj.user._id,
                                            title: 'Account Created', 
                                            type: 'Milestone',  
                                            notes: mObj.user.businessName + ' created an account with ' + mObj.plan.productName + '.',
                                            journey: {section: 'start', name: 'Account Created'}});
                    return Mailer.renderTemplateAndSend(mObj.user.email, {user: mObj.user.toJSON(), isRenew: true }, 'welcome-slapster')
                    .then(res=>{
                        return activityController.create({ userId: mObj.user._id,
                                                title: 'Auto Email Sent', 
                                                type: 'Communication',  
                                                notes: mObj.user.businessName + ' created an account with ' + mObj.plan.productName + '.'});
                    });
                }
                activityController.create({ userId: mObj.user._id,
                                            title: 'T&C Signed',
                                            type: 'Milestone',
                                            notes: mObj.user.businessName + ' agreed T&C Signed.',
                                            journey: {section: 'start', name: 'T&C Signed'}});                                       
                activityController.create({ userId: mObj.user._id,
                                            title: 'Payment Set Up', 
                                            type: 'Milestone',  
                                            notes: mObj.user.businessName + ' set up the payment.',
                                            journey: {section: 'start', name: 'Payment Set Up'}});
                
                return mObj.user;
            })
            .catch((err) => {
                // if (err instanceof StripeError) {
                if (mObj.user)
                    return mObj.user.remove().then(() => {
                        throw err;
                    })
                else
                    throw err;
            });
    }

    static signUpSaveUser(req) {
        if(!req.body.isRenew) {
            return User.load({email: req.body.email}).then((user)=>{
                if (!user)
                    return user;
                else
                    throw new CustomError('Email duplicated', 'BAD_DATA');
            })
            .then((user)=>{
                return new User(req.body).save();
            });
        } else {
            let user_id = null;
            return User.load({_id: req.body.renewFrom})
            .then((user)=>{
                req.body.billingAddress = user.billingAddress;
                req.body.password = user.password;
                req.body.finishedSteps = [0];
                req.body.stripeId = user.stripeId;
                req.body.stripeSource = user.stripeSource;
                req.body.createdAt = new Date();
                
                delete req.body.planDate;
                delete req.body.code;
                delete req.body.check;

                return User.collection.insert(req.body);
                
            })
            .then((resp) => {
                user_id = resp.insertedIds[0];
                return userController.getFinishedSteps(null, req.body.renewFrom);
            })
            .then((stepInfoFrom) => {
                if (!stepInfoFrom.slapMindset || !stepInfoFrom.idealClient || !stepInfoFrom.statement) {
                    throw new Error('Cannot renew from new account.');
                    return;
                }
                var slapMindset = stepInfoFrom.slapMindset.toJSON();
                delete slapMindset._id;
                slapMindset.userId = user_id;
                var idealClient = stepInfoFrom.idealClient.toJSON();
                delete idealClient._id;
                idealClient.userId = user_id;
                var statement = stepInfoFrom.statement.toJSON();
                delete statement._id;
                statement.userId = user_id;
                
                return Promise.all([
                    new IdealClient(idealClient).save(),
                    new Statement(statement).save(),
                    new SlapMindset(slapMindset).save()
                ]);
                
            })
            .then(resps => {
                return User.load({_id: user_id});
            });
            
        }
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
                return Mailer.renderTemplateAndSend(user.email, {user: user.toJSON(), link: config.host + '#!/reset/' + user.token }, 'reset-password');
            })
            .then((res)=>{
                return res;
            })
            .catch((err) => {
                console.log(err);
                throw new CustomError('Not send mail!', 'SERVICE_UNAVAILABLE');
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
        var u;
        return User.load({_id: req.decoded._doc._id}).then(function(user){
            u = user;
            return User.list({criteria: { businessName: user.businessName } })
        })
        .then(function(users){
            var user = u.toJSON();
            delete user.password;
            delete user.stripeId;
            delete user.stripeSource;
            user.accounts = users.map(u=>{
                    
                delete u.password;
                delete u.stripeId;
                delete u.stripeSource;
                return u;
            });
            return user;
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