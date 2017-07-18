let mongoose = require('../../libs/mongoose');
let Schema = mongoose.Schema;
let ExcuteItem = require('./class/ExcuteItem');

let schema = new Schema({
    userId: {
        type: String
    },
    title: {
        type: String,
        // Disable required for refextion title can be empty when blank.
        // required: 'Name is not empty'

    },
    type: {
        type: String,
        required: 'Type is not empty'
    },
    dueDate: {
        type: String
    },
    notes: {
        type: String,
        default: null
    },
    progress: {
    	type: Number,
    	required: 'Progress is not empty'
    },
    //Specific to Sales Unit
    saleUnit: {
        type: Number
    },
    //Specific to Reflextion
    feeling: {
    	type: Object,
    	default: null
    },
    reflextWhat: { // week, month, quater
        type: String
    },  
    //For prior 3 default actions when user enters slapexcute before start date.
    // 0 : none 1: prior actions 3: prior reflections
    isPriorItem: {
        type: Number,
        default: 0
    },
});

schema.loadClass(ExcuteItem);

module.exports = mongoose.model('ExcuteItem', schema);