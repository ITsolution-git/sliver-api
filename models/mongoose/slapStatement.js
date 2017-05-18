const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const Statement = require('./class/Statement');

const schema = new Schema({
    userId: {
        type: String
    },
    yourStatement: {
        type: Object
    },
    stepOneSummary: {
        type: Object
    }
});

schema.loadClass(Statement);

module.exports = mongoose.model('Statement',schema);