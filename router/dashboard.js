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
let yearGoalController = require('../controllers/yearGoalController');
let actionPlanController = require('../controllers/actionPlanController');
let excuteItemsController = require('../controllers/excuteItemsController');
let activityController = require('../controllers/activityController');
let excuteController = require('../controllers/excuteController');

const runAction = (action, req, res) => {
    action(req, res)
        .then((data) => {
            console.log("Data : " + data);
            res.status(200).send(data);
            return;
        })
        .catch((err) => {
            console.log('Router: ' + err);
            res.status(err.status || 400).send({err: err.name ? err.name : 'Error', message:err.message});
            return;
        });
};

//Auth
router.get('/auth/', isAuth, (req, res) => runAction(authController.authToken, req, res));
router.post('/auth/selectslapyear/:id', isAuth, (req, res) => runAction(authController.selectSLAPyear, req, res));
router.post('/auth/', signinValid, (req, res) => runAction(authController.signin, req, res));
router.post('/auth/signup', signupValid, (req, res) => runAction(authController.signup, req, res));

// router.post('/createProduct', productValid, (req,res) => runAction(productController.create,req,res));

//Dashboard buy
router.get('/products/plans', (req, res) => runAction(productController.getPlans, req, res));
router.get('/products/builds', (req, res) => runAction(productController.getBuilds, req, res));
router.get('/products/all', (req, res) => runAction(productController.getAll, req, res));
//Dashboard buy couponValid
router.get('/coupon/:code/:planId', (req, res) => runAction(couponController.isValidCode, req, res));

//Dashboard settingUser
router.get('/payments', isAuth, (req, res) => runAction(financialTrackerController.getPaymentsByUser, req, res));

//Get All step information by user_id or req.decoded._doc.id
router.get('/getFinishedUserStep/:user_id', isAuth, (req, res) => runAction(userController.getFinishedStepsForUser, req, res));
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

//1YearGoal
router.post('/personalExpenses', isAuth, (req, res) => runAction(yearGoalController.setPersonalExpenses, req, res));
router.get('/personalExpenses', isAuth, (req, res) => runAction(yearGoalController.getPersonalExpenses, req, res));
router.post('/fixedBusinessExpenses', isAuth, (req, res) => runAction(yearGoalController.setFixedBusinessExpenses, req, res));
router.get('/fixedBusinessExpenses', isAuth, (req, res) => runAction(yearGoalController.getFixedBusinessExpenses, req, res));
router.post('/revenueStreams', isAuth, (req, res) => runAction(yearGoalController.setRevenueStreams, req, res));
router.get('/revenueStreams', isAuth, (req, res) => runAction(yearGoalController.getRevenueStreams, req, res));

//Action Plan

router.post('/worldAroundYou', isAuth, (req, res) => runAction(actionPlanController.setWorldAroundYou, req, res));
router.get('/worldAroundYou', isAuth, (req, res) => runAction(actionPlanController.getWorldAroundYou, req, res));
router.post('/doubleCheckStartDate', isAuth, (req, res) => runAction(mindsetController.setStartDate, req, res));

router.post('/whatsHappening', isAuth, (req, res) => runAction(actionPlanController.setWhatsHappening, req, res));
router.get('/whatsHappening', isAuth, (req, res) => runAction(actionPlanController.getWhatsHappening, req, res));

router.post('/rateConnectingStrategies', isAuth, (req, res) => runAction(actionPlanController.setRateConnectingStrategies, req, res));
router.get('/rateConnectingStrategies', isAuth, (req, res) => runAction(actionPlanController.getRateConnectingStrategies, req, res));

//Excute
router.post('/tourExecute', isAuth, (req, res) => runAction(excuteController.setFinishBuild, req, res));

//Excute Items

router.post('/excuteItems', isAuth, (req, res) => runAction(excuteItemsController.create, req, res));
router.get('/excuteItemsByUser/:user_id', isAuth, (req, res) => runAction(excuteItemsController.getExcuteItemsByUser, req, res));
router.get('/excuteItems', isAuth, (req, res) => runAction(excuteItemsController.getExcuteItems, req, res));
router.delete('/excuteItems/:id', isAuth, (req, res) => runAction(excuteItemsController.remove, req, res));
router.put('/excuteItems/:id', isAuth, (req, res) => runAction(excuteItemsController.update, req, res));


//AuthAdmin
router.get('/auth/reset', (req, res) => runAction(authController.sendToken, req, res));
router.post('/auth/check-password', (req, res) => runAction(authController.checkPassword, req, res));

//Log Activity
router.post('/acitivites/:user_id', isAuth, (req, res) => runAction(activityController.create, req, res));
router.get('/acitivites/:user_id', isAuth, (req, res) => runAction(activityController.getActivitys, req, res));
router.delete('/acitivites/:user_id/:id', isAuth, (req, res) => runAction(activityController.remove, req, res));
router.put('/acitivites/:user_id/:id', isAuth, (req, res) => runAction(activityController.update, req, res));

//Change ME
router.post('/me/', isAuth, (req, res) => runAction(userController.updateMe, req, res));
router.post('/me/change-password', isAuth, (req, res) => runAction(userController.changeMyPassword, req, res));
router.post('/me/change-card', isAuth, (req, res) => runAction(userController.changeMyCard, req, res));
router.get('/me/current-card', isAuth, (req, res) => runAction(userController.currentMyCard, req, res));

module.exports = router;