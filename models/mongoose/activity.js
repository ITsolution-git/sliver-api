let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
let Activity = require('./class/Activity');

let schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
    },
    type: {
        type: String,
        required: 'Type is not empty'
    },
    notes: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    journey: {
        type: Object,
        default: null
    },
    extra: {
        type: Object,
        default: null
    },
});

schema.loadClass(Activity);

module.exports = mongoose.model('Activity', schema);