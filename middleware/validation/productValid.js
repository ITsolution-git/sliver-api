module.exports = (req,res,next) => {
    req.assert('productName')
        .notEmpty().withMessage('Product name is not empty')
        .isLength({min : 4}).withMessage('Product name is min 4 letters');

    req.assert('productDescription')
        .notEmpty().withMessage('Product description is not empty');

    req.assert('costProduct')
        .isInt().withMessage('Cost plan is only number');

    req.assert('billingFrequency')
        .isInt().withMessage('Billing frequency is require');


    req.getValidationResult()
        .then((result) => {
            if(!result.isEmpty()) {
                res.status(400).send(result.array());
                // res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
                return;
            }
            next();
        });
};