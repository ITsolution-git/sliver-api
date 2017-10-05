const mongoose = require('./../../libs/mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: [],
    webinars: []
});


module.exports = mongoose.model('webinars',schema);