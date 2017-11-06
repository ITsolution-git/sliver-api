const Moment = require('moment');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const ExecuteItem = mongoose.model('ExcuteItem');
const YearGoal = mongoose.model('YearGoal');
const Promise = require('bluebird');
const ActionPlan = mongoose.model('ActionPlan');
const Activity = mongoose.model('Activity');
const Payment = mongoose.model('Payment');
const ExpertReport = mongoose.model('ExpertReport');

class expertReportService {

    static create() {
        return User.find({role: 2})
        .then(experts => {
            if (experts) 
                Promise.map(experts, element => {
                    let report = {};
                    report.expertId = element._id;
                    return expertReportService.getUsersAssignedToExpert(element._id)
                .then(users => {
                    report.assignedUsers = users;
                    return expertReportService.getUsersByPlan(users)
                }).then((usersByPlan) => {
                    report.assignedUsersByPlan = usersByPlan;
                    return (new ExpertReport(report)).save();
                })
                })
        })
    }

    static getUsersAssignedToExpert(expertId) {
        return User.find({expertId: expertId, stripeSubscription: {$ne: null}});         
    }

    static getUsersByPlan(users) {
        let obj = {}; 
        return Product.find({typeProduct: 1})
        .then(products => {
            products.map(product => obj[product.productName] = []);
            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (products[i]._id == users[j].planId) {
                        obj[products[i].productName].push(users[j]._id);
                    }
                }
            } return obj;
        })
    }

}



module.exports = expertReportService;