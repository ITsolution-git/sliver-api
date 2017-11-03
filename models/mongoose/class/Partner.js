const Promise = require('bluebird');
const moment = require('moment');
const CustomError = require('../../../libs/error/CustomError');

class Partner {

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
        const field = options.field || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return this.find(criteria)
            .limit(limit)
            .select(field)
            .skip(limit * page)
            .exec();
    }

}

module.exports = Partner;