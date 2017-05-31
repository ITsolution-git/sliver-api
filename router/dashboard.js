const express = require('express');
const router = express.Router();

//Validators
const validate = require('../libs/class/ParamValidator');
let signinValid = require('../middleware/validation/signinValid');
let signupValid = require('../middleware/validation/signupValid');
let productValid = require('../middleware/validation/productValid');
let authValidation = require('../middleware/validation/authValidation');

//Middleware
const isAuth = require('../middleware/isAuth');

//Controllers
let authController = require('../controllers/authController');
let userController = require('../controllers/userController');
let couponController = require('../controllers/couponController');
let productController = require('../controllers/productController');
let financialTrackerController = require('../controllers/financialTrackerController');
let mindsetController = require('../controllers/mindsetController');
let idealClientController = require('../controllers/idealClientController');
let statementController = require('../controllers/statementController');

const runAction = (action, req, res) => {
    action(req, res)
        .then((data) => {
            console.log("Data : " + data);
            res.status(200).send(data);
            return;
        })
        .catch((err) => {
            console.log('Router: ' + err);
            res.status(err.status || 400).send(err);
            return;
        });
};

//Auth
router.get('/auth/', isAuth, (req, res) => runAction(authController.authToken, req, res));
router.post('/auth/', signinValid, (req, res) => runAction(authController.signin, req, res));
router.post('/auth/signup', signupValid, (req, res) => runAction(authController.signup, req, res));

// router.post('/createProduct', productValid, (req,res) => runAction(productController.create,req,res));

//Dashboard buy
router.get('/products/plans', (req, res) => runAction(productController.getPlans, req, res));
router.get('/products/builds', (req, res) => runAction(productController.getBuilds, req, res));

//Dashboard buy couponValid
router.get('/coupon/:code/:planId', (req, res) => runAction(couponController.isValidCode, req, res));

//Dashboard settingUser
router.get('/payments', isAuth, (req, res) => runAction(financialTrackerController.getPaymentsByUser, req, res));

router.get('/getFinishedUserStep', isAuth, (req, res) => runAction(userController.getFinishedSteps, req, res));

//SlapMindset
router.get('/allMindsetUser', isAuth, (req, res) => runAction(mindsetController.getAllMindset, req, res));
router.post('/yourCommitment', isAuth, (req, res) => runAction(mindsetController.setYourCommitment, req, res));
router.post('/areYourStuck', isAuth, (req, res) => runAction(mindsetController.setAreYouStuck, req, res));
router.post('/privilegeAndResponsibility', isAuth, (req, res) => runAction(mindsetController.setPrivilegeAndResponsibility, req, res));
router.post('/slapStartDate', isAuth, (req, res) => runAction(mindsetController.setStartDate, req, res));

//SlapStatement
router.post('/yourStatement', isAuth, (req, res) => runAction(statementController.setYourStatement, req, res));
router.get('/yourStatement', isAuth, (req, res) => runAction(statementController.getYourStatement, req, res));
router.post('/step1Summary', isAuth, (req,res) => runAction(statementController.setStepOneSummary, req,res));
router.get('/step1Summary', isAuth, (req,res) => runAction(statementController.getStepOneSummary, req,res));

//IdealClient
router.post('/whoAreYouIdealClient', isAuth, (req, res) => runAction(idealClientController.setWhoAreYouIdealClient, req, res));
router.get('/whoAreYouIdealClient', isAuth, (req, res) => runAction(idealClientController.getWhoAreYouIdealClient, req, res));
router.post('/nameYourIdealClient', isAuth, (req, res) => runAction(idealClientController.setNameIdealClient, req, res));
router.get('/nameYourIdealClient', isAuth, (req, res) => runAction(idealClientController.getNameIdealClient, req, res));

//AuthAdmin
router.get('/auth/reset', (req, res) => runAction(authController.sendToken, req, res));
router.post('/auth/check-password', (req, res) => runAction(authController.checkPassword, req, res));


module.exports = router;