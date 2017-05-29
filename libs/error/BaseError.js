class BaseError extends Error {
    constructor(message, literal, ...options) {
        super();

        this.literal = literal;
        this.message = message;
       
        if(!BaseError.codes[this.literal]){
            throw new Error('Bad literal');
        }
       
        this.status = BaseError.codes[this.literal];
        
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
        this.options = options;
    }
}

BaseError.codes = {
    OK : 200,
    BAD_DATA : 400,
    UNAUTH : 401,
    NOT_FOUND : 404,
    SERVICE_UNAVAILABLE : 503
};

module.exports = BaseError;