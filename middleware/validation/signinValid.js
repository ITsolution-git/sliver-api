module.exports = (req,res,next) => {
    req.assert('email')
        .notEmpty().withMessage('email empty')
        .isEmail().withMessage('is not email');

    req.assert('password')
        .notEmpty().withMessage('password empty')
        .isLength({min : 4}).withMessage('password length < 6');

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