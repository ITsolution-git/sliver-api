const config = require('./../config');
const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    let token = req.headers['Authorization'];

    if(token && (token.indeoxOf('BEARER') != -1) && token.split(' ')>=2) {
        
        jwt.verify(token.split(' ')[1], config.secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                
                next();
            }
        });
    } else {
        return res.status(404).send('User not found');
    }
};