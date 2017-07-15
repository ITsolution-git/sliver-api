module.exports = (req,res,next) => {
    if(req.decoded) {
        return req.decoded._doc.role == 1 ? next() : res.status(403).send('Forbidden');
    } else {
        return res.status(403).send('UnAuthorized');
    }
};