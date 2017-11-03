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

class expertReportController {

    static create(req) {
        let report = req.body;
        report.totalHours = 0;
        report.totalMissedMeetings = 0;
        return expertReportController.getUsersAssignedToExpert(req.body.expertId)
        .then(users => {
            report.countAssignedUsers = users.length;
            return expertReportController.getUsersByPlan(users).then(usersByPlan => {
                report.countAssignedUsersByPlan = usersByPlan;
                return users;
            })
        }).then(users => {
            return expertReportController.getCountHours(users, req.body.from, req.body.to).then(hours => {
                for (let i = 0; i < hours.length; i++)
                    report.totalHours += +hours[i];
                report.totalHours = report.totalHours/60;
                return users;
            })
        }).then(users => {
            return expertReportController.getCountOfMissedMeetings(users, req.body.from, req.body.to).then(count => {
                for (let i = 0; i < count.length; i++)
                report.totalMissedMeetings += count[i].length;
                return report;
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
            products.map(product => obj[product.productName] = 0);
            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < users.length; j++) {
                    if (products[i]._id == users[j].planId) 
                        obj[products[i].productName]++;
                }
            } return obj;
        })
    }

    static getCountHours(users, from, to) {
        return Promise.map(users, element => {
            return Activity.find({userId: element._id, type: 'SLAPexpert', createdAt: {$gte: Moment(from), $lte: Moment(to)}})
            .then(interactions => {
                let sum = 0;
                interactions.map(int => {
                    sum += +int.extra.callLength;
                })
                return sum;
            })
        })
    }

    static getCountOfMissedMeetings(users, from, to) {
        return  Promise.map(users, element => {
            return Payment.find({userId: element._id, status: 1,
            paymentDate:  {$gte: Moment(from), $lte: Moment(to)}, $or:[{'products.name': 'Missing 1:1 Call'}, {'products.name': 'Missing Group Call'}]})
        }).then(payment => {
            return payment;
        })
    }



}



module.exports = expertReportController;