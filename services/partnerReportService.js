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
const Partner = mongoose.model('Partner');
const PartnerReport = mongoose.model('PartnerReport');

class PartnerReportService {

    static create() {
        return Partner.find()
        .then(partners => {
            if (partners.length){
                Promise.map(partners, element => {
                    let report = {};
                    report.totalShareToPartner = 0;
                    report.assignedUsers = [];
                    report.assignedUsersByPlan = {};
                    report.partnerId = element._id;
                    report.totalIncome = 0;
                    return PartnerReportService.getUsersAssignedToPartner(element._id)
                .then(users => {
                    report.assignedUsers = users;
                    return PartnerReportService.getUsersByPlan(users)
                }).then(usersByPlan => {
                    report.assignedUsersByPlan = usersByPlan;
                    return PartnerReportService.getTotalIncome(usersByPlan)
                }).then(income => {
                    report.totalIncome = income;
                    report.totalShareToPartner += +income/100 * +element.revenue_percent;
                    return (new PartnerReport(report)).save();
                })
            })
            }
        })
    }

    static getUsersAssignedToPartner(partnerId) {
        if (!partnerId) return;
        return User.find({partnerId: partnerId, stripeSubscription: {$ne: null}});         
    }

    static getTotalIncome(usersByPlan) {
        let sum = 0;
        return Product.find({typeProduct: 1})
        .then(products => {
            if (!products.length) return sum;
            for (let i = 0; i < products.length; i++) {
                if (usersByPlan[products[i].productName].length > 0)
                sum += usersByPlan[products[i].productName].length * (products[i].costProduct/30);
            }
            return sum;
        })
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



module.exports = PartnerReportService;