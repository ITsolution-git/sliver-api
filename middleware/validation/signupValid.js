module.exports = (req,res,next) => {
    req.assert('name')
        .notEmpty().withMessage('name empty')
        .isLength({min : 1, max : 30}).withMessage('name length >= 30');

    req.assert('email')
        .notEmpty().withMessage('email empty')
        .isEmail().withMessage('correct email');

    req.assert('password')
        .notEmpty().withMessage('password empty')
        .isLength({min : 6, max : 30}).withMessage('businessName length 4 <= and >= 20')
        .equals(req.body.confirmPassword).withMessage('password is invalid confirm');

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