const Promise = require('bluebird');
const moment = require('moment');
const CustomError = require('../../../libs/error/CustomError');

class PartnerReport {

    /**
     * 
     * @param options
     * @returns {Promise}
     */
    static load(options) {
        return this.findOne(options).exec();
    }

    /**
     * List Products
     *
     * @param {Object} options
     * @api private
     */
    static list(options) {
        options = options || {};
        const criteria = options.criteria || {};
        return this.find(criteria)
            .exec();
    }


    static run() {
        
    }
}

module.exports = PartnerReport;