const express = require('express');
const router = express.Router();

//Validators
let signinValid = require('../middleware/validation/signinValid');
let signupValid = require('../middleware/validation/signupValid');
let productValid = require('../middleware/validation/productValid');

//Middleware
const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/isAuth');

//Controllers
let authController = require('../controllers/authController');
let couponController = require('../controllers/couponController');
let productController = require('../controllers/productController');
let userController = require('../controllers/userController');
let financialTrackerController = require('../controllers/financialTrackerController');
let activityController = require('../controllers/activityController');
let emailTemplatesController = require('../controllers/emailTemplatesController');
let reportController = require('../controllers/reportController');
let partnerReportController = require('../controllers/partnerReportController');
let partnerController = require('../controllers/partnerController');
let expertReportController = require('../controllers/expertReportController');
//TODO: I am going to add JOI validation.~~~

const runAction =  (action, req, res) => {
    action(req, res)
        .then( (data) => {
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
//Status
router.get('/', (req, res) => {
    res.json({status: "/admin is running healthy."});
});

//Admin
router.get('/auth/', isAuth, (req, res) => runAction(authController.authToken, req, res));
router.post('/auth', signinValid, (req,res) => runAction(authController.signinAdmin,req,res));
router.get('/auth/:id', isAuth, (req, res) => runAction(authController.adminAsUser, req, res));


//Manage Users 
router.put('/users/:id',isAuth, isAdmin, (req, res) => runAction(userController.updateUser, req, res));
router.post('/users',isAuth, isAdmin, (req, res) => runAction(userController.createUser, req, res));
router.get('/users/:id',isAuth, isAdmin, (req, res) => runAction(userController.getUser, req, res));
router.delete('/users/:id',isAuth, isAdmin, (req, res) => runAction(userController.deleteUser, req, res));
router.get('/users',isAuth, isAdmin, (req, res) => runAction(userController.getUsers, req, res));


//Manage Products
router.post('/products',isAuth, isAdmin, productValid, (req, res) => runAction(productController.create, req, res));
router.get('/products',isAuth, isAdmin,  (req, res) => runAction(productController.getProducts, req, res));
router.get('/products/:id',isAuth, isAdmin, (req, res) => runAction(productController.getProduct, req, res));
router.put('/products/:id',isAuth, isAdmin, productValid, (req, res) => runAction(productController.updateProduct, req, res));
router.delete('/products/:id',isAuth, isAdmin, (req, res) => runAction(productController.deleteProduct, req, res));
router.get('/plans',isAuth, isAdmin, (req,res) => runAction(productController.getPlans, req, res));

//Manage Coupons
router.post('/coupon',isAuth, isAdmin, (req,res) => runAction(couponController.create, req,res));
router.get('/coupon',isAuth, isAdmin, (req,res) => runAction(couponController.getCoupons, req,res));
router.get('/coupon/:id',isAuth, isAdmin, (req,res) => runAction(couponController.getCoupon, req,res));
router.put('/coupon/:id',isAuth, isAdmin, (req, res) => runAction(couponController.update, req, res));
router.delete('/coupon/:id',isAuth, isAdmin, (req,res) => runAction(couponController.remove,req,res));

//Reports Financial Tracker
router.get('/financialTracker',isAuth, isAdmin, (req,res) => runAction(financialTrackerController.getPayments,req,res));

//Payments

router.get('/payments/paymentsByUser/:user_id', isAuth, isAdmin, (req, res) => runAction(financialTrackerController.getPaymentsByUserID, req, res));
router.post('/payments/charge/:user_id', isAuth, isAdmin, (req, res) => runAction(financialTrackerController.chargeUser, req, res));
router.post('/payments/subscription/toggle/:user_id', isAuth, isAdmin, (req, res) => runAction(financialTrackerController.toggleSubscription, req, res));
router.get('/stripe-payments/:user_id', isAuth, isAdmin, (req, res) => runAction(financialTrackerController.getStripePaymentsByUser, req, res));

//Email templates
// router.post('/emailtemplates',isAuth, isAdmin, (req,res) => runAction(couponController.create, req,res));
router.get('/emailtemplates/:id',isAuth, isAdmin, (req,res) => runAction(emailTemplatesController.getTemplate, req,res));
router.get('/emailtemplates',isAuth, isAdmin, (req,res) => runAction(emailTemplatesController.getAllTemplates, req,res));
router.put('/emailtemplates/:id',isAuth, isAdmin, (req, res) => runAction(emailTemplatesController.updateTemplate, req, res));
// router.delete('/emailtemplates/:id',isAuth, isAdmin, (req,res) => runAction(couponController.remove,req,res));


//Manage Reports
router.post('/report',isAuth, isAdmin, (req,res) => runAction(reportController.create, req,res));
router.get('/report',isAuth, isAdmin, (req,res) => runAction(reportController.getReports, req,res));
router.get('/report/:id',isAuth, isAdmin, (req,res) => runAction(reportController.getReport, req,res));
router.put('/report/:id',isAuth, isAdmin, (req, res) => runAction(reportController.update, req, res));
router.delete('/report/:id',isAuth, isAdmin, (req,res) => runAction(reportController.remove,req,res));
router.post('/partner-report', isAuth, isAdmin, (req,res) => runAction(partnerReportController.create, req, res));
router.post('/expert-report', isAuth, isAdmin, (req,res) => runAction(expertReportController.create, req, res));

//Manage Partners 
router.post('/partner', isAuth, isAdmin, (req, res) => runAction(partnerController.create, req, res));
router.get('/partner', isAuth, isAdmin, (req, res) => runAction(partnerController.getPartners, req, res));
router.get('/partner/:id', isAuth, isAdmin, (req, res) => runAction(partnerController.getPartner, req, res));
router.put('/partner/:id', isAuth, isAdmin, (req, res) => runAction(partnerController.update, req, res));
router.delete('/partner/:id', isAuth, isAdmin, (req, res) => runAction(partnerController.remove, req, res));
module.exports = router;