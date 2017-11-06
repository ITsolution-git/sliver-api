const Moment = require('moment');
const mongoose = require('./../libs/mongoose');
const User = mongoose.model('User');
const PartnerReport = mongoose.model('PartnerReport');
const Partner = mongoose.model('Partner');
const Product = mongoose.model('Product');
const ExecuteItem = mongoose.model('ExcuteItem');
const YearGoal = mongoose.model('YearGoal');
const Promise = require('bluebird');
const ActionPlan = mongoose.model('ActionPlan');
const stripe = require('../services/stripe');
const StripeService = stripe.service;

class partnerReportController {

    static unique(arr) {
        var obj = {};
      
        for (var i = 0; i < arr.length; i++) {
          var str = arr[i];
          obj[str] = true; 
        }
      
        return Object.keys(obj); 
      }

    static create(req){
        let report = req.body;
        let assignedUsersByPlan = {};
        report.sum = 0;
        report.countAssignedUsersByPlan = {};
        return PartnerReport.find({partnerId: req.body.partnerId,
        createdAt: {$gte: req.body.from, $lte: req.body.to}
        }).then(reports => {
            if(reports && reports[0]){
                let assignedUsers = [];
                let assignedUsersByPlan = {};
                let obj = {};
                    for (let i = 0; i < reports.length; i++) 
                        reports[i].assignedUsers.forEach(element => {
                            assignedUsers.push(element._id);
                        })
                    
                Object.keys(reports[0].assignedUsersByPlan).forEach(element => {
                    assignedUsersByPlan[element] = [];
                    report.countAssignedUsersByPlan[element] = 0;
                })
                report.totalIncome = 0;
                report.totalShareToPartner = 0;
                for (let i = 0; i <reports.length; i++) {
                    report.totalIncome += +reports[i].totalIncome;
                    report.totalShareToPartner += +reports[i].totalShareToPartner;
                    Object.keys(reports[i].assignedUsersByPlan).forEach(element => {
                        if (reports[i].assignedUsersByPlan[element]) {
                            assignedUsersByPlan[element].push(reports[i].assignedUsersByPlan[element])}
                    })
                }
                
                Object.keys(assignedUsersByPlan).forEach(element => {
                    let el = [];
                    if (element) {
                            el = partnerReportController.unique(assignedUsersByPlan[element]);
                            if (el != '') {
                                report.countAssignedUsersByPlan[element] = el.length;
                            }
                    }
                })
                
                report.countAssignedUsers = partnerReportController.unique(assignedUsers).length;
                
                
                let userPayments = [];

                for (let i = 0; i < report.countAssignedUsers; i++)
                userPayments.push(StripeService.getPayments(assignedUsers[0], 50));
                return userPayments;
            }
        }).then(userPayments => {
                return Promise.all(userPayments)
        }).then(payments => {
                payments[0].forEach(element => {
                    if (Moment(element.paymentDate).isBetween(Moment(req.body.from), Moment(req.body.to))) {
                    report.sum += +element.amountCharges; }
                })
                return report; 
            })    
    }


}





module.exports = partnerReportController;