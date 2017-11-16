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
const Mindset = mongoose.model('slapMindset');

class partnerReportController {

    static unique(arr) {
        var obj = {};
      
        for (var i = 0; i < arr.length; i++) {
          var str = arr[i];
          obj[str] = true; 
        }
      
        return Object.keys(obj); 
    }

    static getCurrentQuater(users) {
        if (users)
            return Promise.map(users, user => {
                return Mindset.find({userId: user._id})
                .then(function (mindset){
                    let quaters = [];
                    if (mindset[0] && mindset[0].slapStartDate){   
                        let startDate = Moment({year: mindset[0].slapStartDate.year, month: mindset[0].slapStartDate.month-1}).format('YYYY-MM-DD');
                        quaters.push(Moment(startDate).format('YYYY-MM-DD'));

                        for(let i = 0; i < 4; i++)
                            quaters.push(Moment(quaters[i]).add(3, 'month').format('YYYY-MM-DD'));

                        for(let i = 0; i < quaters.length; i++) 
                            if (Moment().isBetween(quaters[i], quaters[i+1])) {
                                user.currentQuater = {number: i+1, startDate: quaters[i], endDate: quaters[i+1]};
                            }

                        let months = [];

                        if (!user.currentQuater) user.currentQuater = 'Not Started!';
                        else { 
                            for(let i = 0; i < 3; i++) {
                                months.push(Moment(quaters[user.currentQuater-1]).add(i, 'month'))
                                if (Moment().month() == Moment(months[i]).month())
                                    user.currentMonth = i+1; 
                            }
                        }
                        return user;
                    }
                return user;
                })
            })
    }

    static getUserQuaterlyGoal(users) { 
        let goals = [];
        let revenues = [];
        let sum = 0;
        return Promise.map(users, user => {
            return ExecuteItem.find({userId: user._id, type: 'sales', progress: 100})
            .then(goal => {
                goals = goal;
                return YearGoal.find({userId: user._id})
            .then(revenue => {
                    if (!revenue[0]) return;
                    let obj = revenue[0].revenueStreams.revenues;
                    for (var key in obj) {
                        if (obj[key].deleted == false) {
                            revenues.push(obj[key]);
                        }
                    }
                })
            .then(() => {
                return ActionPlan.find({userId: user._id})
            .then(totalGoal => {
                let el = 0;
                let totalGoals = 0;
			    if (totalGoal && totalGoal.length > 0 && totalGoal[0].whatsHappening) {
				        if (totalGoal[0].whatsHappening[user.currentQuater.number-1].units) {
                            Object.keys(totalGoal[0].whatsHappening[user.currentQuater.number-1].units).forEach(function (element, index){
                                for (let i=0; i<revenues.length; i++) {
                                    if (revenues[i].name == element) 
                                        el = revenues[i].sellingPrice;}
                                totalGoals = (+totalGoal[0].whatsHappening[user.currentQuater.number-1].units[element] * el) + totalGoals;
                            })
                        }
                        for(let i=0; i<goals.length; i++) {
                            for (let j = 0; j < revenues.length; j++)
                            if (revenues[j].id == goals[i].title)
                            if(Moment(goals[i].dueDate).isBetween(user.currentQuater.startDate, user.currentQuater.endDate, 'day', '[]'))
                                {sum += (+goals[i].saleUnit * +revenues[j].sellingPrice);}
				    }
                }
                    if (totalGoals > 0)
                        user.quaterlyGoal = sum/totalGoals * 100;
                    else user.quaterlyGoal = 'Not Exist';
                    
                    return user; 
            })
            })
            })
        })
    }

    static getUserAnnualGoal(users) {
        let goals = [];
        let totalGoals = 0; 
        let revenues = [];
        let sum = 0;
        return Promise.map(users, user => {
            return ExecuteItem.find({userId: user._id, type: 'sales', progress: 100})
            .then(goals => {
                return YearGoal.find({userId: user._id})
            .then(revenue => {
                    if (!revenue[0]) return;
                    let obj = revenue[0].revenueStreams.revenues;
                    for (var key in obj) {
                        if (obj[key].deleted == false) {
                            revenues.push(obj[key]);
                        }
                    }
                })
            .then(() => {
                return ActionPlan.find({userId: user._id})
            .then(totalGoal => {
                    let el = 0;
			        if (totalGoal && totalGoal.length > 0 && totalGoal[0].whatsHappening) {
                        for (let i=0; i<totalGoal[0].whatsHappening.length; i++) {
				            if (totalGoal[0].whatsHappening[i].units) {
                                Object.keys(totalGoal[0].whatsHappening[i].units).forEach(function (element, index){
                                    for (let i=0; i<revenues.length; i++) {
                                        if (revenues[i].name == element) 
                                            el = revenues[i].sellingPrice;}
                                    totalGoals = (+totalGoal[0].whatsHappening[i].units[element] * el) + totalGoals;
                                })
				            }
                        }
                        for(let i=0; i<goals.length; i++) {
				        if (revenues[goals[i].title-1]) {
                            sum = (+goals[i].saleUnit * revenues[goals[i].title-1].sellingPrice) + sum;
				        }
                        }
                        if (totalGoals > 0)
                            user.annualGoal = sum/totalGoals * 100;
                        else user.annualGoal = 'Not Exist';
			        }
                return user; })
            })
            })
        })
    }

    static getReports(reports, report) {
        let assignedUsers = [];
        let assignedUsersByPlan = {};
        let obj = {};
        let used = {};
        let filtered = [];
        for (let i = 0; i < reports.length; i++) {
            reports[i].assignedUsers.forEach(element => {
                assignedUsers.push(element._id);
            }) 
            filtered = reports[i].assignedUsers.filter(function(el) {
                return obj._id in used ? 0:(used[el._id]=1);
            }) 
        }
        report.slapsters = filtered;
        Object.keys(reports[0].assignedUsersByPlan).forEach(element => {
            assignedUsersByPlan[element] = [];
            report.countAssignedUsersByPlan[element] = 0;
        })
        report.totalIncome = 0;
        report.totalShareToPartner = 0;
        for (let i = 0; i <reports.length; i++) {
           // report.totalIncome += +reports[i].totalIncome;
           // report.totalShareToPartner += +reports[i].totalShareToPartner;
            Object.keys(reports[i].assignedUsersByPlan).forEach(element => {
                if (reports[i].assignedUsersByPlan[element].length > 0) {
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

            return {assignedUsers, filtered: report.slapsters};
        }


    static create(req){
        let report = req.body;
        let assignedUsersByPlan = {};
        report.sum = 0;
        report.countAssignedUsersByPlan = {};
        let from = Moment(req.body.from);
        let to = Moment(req.body.to).add(1, 'day');
        let revenue_percent = 0;
        return Partner.findById(req.body.partnerId)
        .then(partner => {
            report.partnerName = `${partner.name} ${partner.lastName}`;
            revenue_percent = partner.revenue_percent;
            return PartnerReport.find({partnerId: req.body.partnerId,
            createdAt: {$gte: from, $lte: to}
        }).then(reports => {
            if(reports.length)
                return partnerReportController.getReports(reports, report) 
        }).then((assignedUsers) => {
            return partnerReportController.getCurrentQuater(assignedUsers.filtered)
        }).then((assignedUsers) => {
            return partnerReportController.getUserAnnualGoal(assignedUsers)
        }).then((assignedUsers) => {
            return partnerReportController.getUserQuaterlyGoal(assignedUsers)
        }).then((assignedUsers) => {
                let userPayments = [];
                    for (let i = 0; i < report.countAssignedUsers; i++)
                        userPayments.push(StripeService.getPayments(assignedUsers[i], 0, true, from.format('X'), to.format('X')));
                    return Promise.all(userPayments);
        }).then(users => {
            if(!users) return;
            users.forEach(userPayments => {
                userPayments.forEach(element => {
                        report.sum += +element.amountCharges;
                        if (element.status) {
                            report.totalIncome += +element.amountCharges - element.discount;
                            report.totalShareToPartner += report.totalIncome * (revenue_percent / 100); 
                        }
                })
            });
            return report;
        })
        })
    }


}





module.exports = partnerReportController;