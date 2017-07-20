const Promise = require('bluebird');
const moment = require('moment');
const CustomError = require('../../../libs/error/CustomError');

class Activity {

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
        // const field = options.field || {};
        // const page = options.page || 0;
        // const limit = options.limit || 30;
        return this.find(criteria)
            // .limit(limit)
            // .select(field)
            // .skip(limit * page)
            .exec();
    }


    /**
     * List Products
     *
     * @param {Object} options
     * @api private
     */
    static  UpdateOrCreate(obj) {
        return this.update({_id: obj._id}, obj, {upsert: true, setDefaultsOnInsert: true});
    }

    static findOneAndUpdate(obj) {
        return this.update({_id: obj._id}, obj, {setDefaultsOnInsert: true});
    }
    
    static findOneAndRemove(obj) {
        return this.remove({_id: obj._id});
    }
}

module.exports = Activity;