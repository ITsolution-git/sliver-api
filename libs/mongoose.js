let mongoose = require('mongoose');
let config = require('../config.js');

mongoose.Promise = require('bluebird');
mongoose.connect(config.db);

module.exports = mongoose;
