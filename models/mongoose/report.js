let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
let Report = require('./class/Report');

let schema = new Schema({
    name: {
        type: String,
        required: 'Name is not empty',
    },
    filter: {
        type: Object,
        required: 'Filter is required'
    },
    createdAt : {
        type: Date,
        default: new Date()
    },
    ranAt: {
        type: Date,
        default: new Date()
    }
});

schema.loadClass(Report);

module.exports = mongoose.model('Report', schema);