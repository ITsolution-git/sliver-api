let mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
let config = require('./config.js');
const fs = require('fs');
const join = require('path').join;
const Promise = require('bluebird');
const moment = require('moment');
mongoose.Promise = require('bluebird');
// mongoose.connect(config.db);
const models = join(__dirname, 'models/mongoose');
// Bootstrap models
fs.readdirSync(models)
    .filter((file) => ~file.search(/^[^\.].*\.js$/))
    .forEach((file) => {
        // console.log(join(models, file));
        require(join(models, file));
    });
const ExcuteItem = mongoose.model('ExcuteItem');

ExcuteItem.find({}).then(list => {
    var items = list.map(elem => {
        elem.dueDate = moment(new Date(elem.dueDate)).format('YYYY MM DD');
        return elem;
    }).filter(elem => {
        return moment(new Date(elem.dueDate)).get('year') === 20170 || moment(new Date(elem.dueDate)).get('year') === 20171;
    }).map(elem => {
        if (moment(new Date(elem.dueDate)).get('year') === 20170)
            elem.dueDate = moment(new Date(elem.dueDate)).set('year', 2017);
        else elem.dueDate = moment(new Date(elem.dueDate)).set('year', 2018);
        elem.dueDate = moment(new Date(elem.dueDate)).format('YYYY MM DD');
        return elem;
    })
    console.log(items);
    return Promise.each(items, (item) => {
        console.log(item._id);
        return ExcuteItem.update({_id: new ObjectId(item._id)}, {$set: {dueDate: moment(new Date(item.dueDate)).format("YYYY-MM-DD")}}).then((elem) => {
            console.log(elem);
            console.log(item);
        });
    })
}).then(() => {
    console.log('finish');
})