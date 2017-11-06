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

class expertReportController {

    static unique(arr) {
        var obj = {};
      
        for (var i = 0; i < arr.length; i++) {
          var str = arr[i];
          obj[str] = true; 
        }
      
        return Object.keys(obj); 
      }

    static create(req) {
        let report = req.body;
        report.totalHours = 0;
        report.totalMissedMeetings = 0;
        let assignedUsersByPlan = {};
        let from = Moment(req.body.from);
        let to = Moment(req.body.to).add(1, 'day');
        report.countAssignedUsersByPlan = {};
        return User.findById(req.body.expertId)
        .then(expert => report.expertName = `${expert.name} ${expert.lastName}`)
        .then(() => {
            return ExpertReport.find({expertId: req.body.expertId, createdAt: {$gte: from, $lte: to}})
            .then(reports => {
                if(reports[0]){
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
                for (let i = 0; i <reports.length; i++)
                    Object.keys(reports[i].assignedUsersByPlan).forEach(element => {
                        if (reports[i].assignedUsersByPlan[element]) {
                        assignedUsersByPlan[element].push(reports[i].assignedUsersByPlan[element])}
                })
                
                Object.keys(assignedUsersByPlan).forEach(element => {
                    let el = [];
                    if (element) {
                            el = expertReportController.unique(assignedUsersByPlan[element]);
                            if (el != '')
                                report.countAssignedUsersByPlan[element] = el.length;
                    }
                })
                report.countAssignedUsers = expertReportController.unique(assignedUsers).length;
                return expertReportController.unique(assignedUsers);
                }
            })
        }).then(users => {
            if (users)
            return expertReportController.getCountHours(users, from, to).then(hours => {
                for (let i = 0; i < hours.length; i++)
                    report.totalHours += +hours[i];
                report.totalHours = report.totalHours/60;
                return users;
            })
        }).then(users => {
            if (users)
            return expertReportController.getCountOfMissedMeetings(users, from, to).then(count => {
                for (let i = 0; i < count.length; i++)
                report.totalMissedMeetings += count[i].length;
                return report;
            })
        })
        
    }


    static getCountHours(users, from, to) {
        return Promise.map(users, element => {
            return Activity.find({userId: element, type: 'SLAPexpert', 'extra.date': {$gte: from, $lte: to}})
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
            return Payment.find({userId: element, status: 1,
            paymentDate:  {$gte: from, $lte: to}, $or:[{'products.name': 'Missing 1:1 Call'}, {'products.name': 'Missing Group Call'}]})
        }).then(payment => {
            return payment;
        })
    }

}



module.exports = expertReportController;