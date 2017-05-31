module.exports = (req,res,next) => {
    if(req.decoded) {
        return req.decoded.admin == 1 ? next() : res.status(403).send('Forbidden');
    } else {
        return res.status(404).send('User not found');
    }
};