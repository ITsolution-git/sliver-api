const mongoose = require('mongoose');
const Report = mongoose.model('Report');
const User = mongoose.model('User');
const Promise = require('bluebird');
const Moment = require('moment');
const Mindset = mongoose.model('slapMindset');
const ActionPlan = mongoose.model('ActionPlan');
const _ = require('lodash');
const Activity = mongoose.model('Activity');
const zipcodes = require('zipcodes');
const partnerController = require('../controllers/partnerReportController');


let allActivities = [{id: 0, name: 'Logged In', dataRange: false},{id: 1, name: 'Did not log in'},{id: 2, name: 'Completed Build Step 1'},{id: 3, name: 'Completed Build Step 2'},{id: 4, name: 'Completed Build Step 3'},{id: 5, name: 'Completed Build Step 4'},{id: 6, name: 'Commited Build'},{id: 7, name: 'Submitted their SLAP'},{id: 8, name: 'Submitted Weekly Reflection'},{id: 9, name: 'Submitted Monthly Reflection'},{id: 10, name: 'Submitted Quarterly Reflection'},{id: 11, name: 'Updated Sales Tracker'},{id: 12, name: 'Updated Action Items'}];
let ActivitiesAll = [{id: 11, name: 'User login', dateRange: false}, {id: 1, name: 'User login', dateRange: false},
{id: 2, name: 'SE Calls Set', dateRange: false}, {id: 3, name: 'SM Calls Set', dateRange: false}, 
{id: 4, name: 'Onboarding Call', dateRange: true}, {id: 5, name: 'Execute Call Set', dateRange: true}, 
{id: 6, name: 'SLAPexpert Call', dateRange: true}, {id: 7, name: 'Accountability Call', dateRange: true}, 
{id: 8, name: 'Q3 Hustle Call Set', dateRange: true}, {id: 9, name: 'Renewal Confirmed', dateRange: true}, 
{id: 10, name: 'SLAPstuff Sent', dateRange: true}];
let countrys = [{id: 0, name: 'International'},{id: 1, name: 'Canada'},{id: 2, name: 'US'}]


class ReportController {
    
    static create(req) {
        let report = req.body;
        
        return (new Report(report)).save();
    }

    static getReports() {
        return Report.list();
    }

    static getReport(req) {
       return Report.load({_id: req.params.id});
    }

    static update(req) {
       return Report.findOneAndUpdate({_id: req.params.id}, req.body);
    }

    static remove(req) {
        return Report.findOneAndRemove({_id: req.body._id});
    }

    static runReport(req) {
        return ReportController.getReport(req)
        .then(report => {
            return ReportController.getUsers(report).then(users => {
                return {users, report}
            })
        })
        .then(result => {
            let {users, report} = result;
            if (!users.length) throw new Error();
            if (_.isUndefined(report.filter.slapStatus)) return result;
            if (!report.filter.slapStatus) {
                if (report.filter.buildStatus) 
                    return {users: users.filter(user => Moment(user.createdAt).isBefore(Moment().subtract(1, 'month'), 'day')), report} 
                else return {users: users.filter(user => Moment(user.createdAt).isBetween(Moment().subtract(1, 'month'), Moment(), 'day', [])), report}
            }
            if (!report.filter.quaters.length) return result;
            if (report.filter.slapStatus) 
            return ReportController.getUsersByQuater(users, report.filter.quaters).then(users => {
                return {users, report}
            }) 
        })
        .then(result => {
            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report.filter.strategies.length) return result;
            return ReportController.getUsersByStrategy(users, report.filter.strategies).then(users => {
                return {users, report}
            })
        })
        .then(result => {
            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report) return;
            if (_.isUndefined(report.filter.activities)) return result;
            if (!report.filter.activities.length) return result;
            return ReportController.getActivities(users, report).then(users => {
                return {users, report}
            })
        })
        .then(result => {

            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report) return;
            if (_.isUndefined(report.filter.paymentStatus)) return result;
            return ReportController.getUsersByPaymentStatus(users, report).then(users => {
                return {users, report}
            })
        })
        .then(result => {

            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report) return;
            if (_.isUndefined(report.filter.declinedStatus)) return result;
            return ReportController.getUserCharges(users, report).then(users => {
                return {users, report}
            })
        })
        .then(result => {

            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report) return;
            if (_.isUndefined(report.filter.country)) return result;
            return ReportController.getUsersByZip(users, report).then(users => {
                return {users, report}
            })
        })
        .then(result => {
            console.log(result);
            let {users, report} = result;
            if (!users.length) throw new Error();
            if (!report) return;
            if (_.isUndefined(report.filter.goalProgress.type)) return result;
            if (_.isUndefined(report.filter.goalProgress.from) && _.isUndefined(report.filter.goalProgress.to)) return result;
            if (!report.filter.slapStatus) return result;
            return ReportController.getUsersByQuater(users, '').then(usersByQuater => {
                if (report.filter.goalProgress.type == 'annual') 
                    return partnerController.getUserAnnualGoal(usersByQuater).then(usersByGoal => {
                        usersByGoal = usersByGoal.filter(user => user.annualGoal >= +report.filter.goalProgress.from && user.annualGoal <= +report.filter.goalProgress.to)
                        return partnerController.getUserQuaterlyGoal(usersByQuater).then(usersByGoal => {
                            return {users: usersByGoal, report}
                        })
                    })
                if (report.filter.goalProgress.type == 'quaterly')
                    return partnerController.getUserQuaterlyGoal(usersByQuater).then(usersByGoal => {
                        usersByGoal = usersByGoal.filter(user => user.quaterlyGoal >= +report.filter.goalProgress.from && user.quaterlyGoal <= +report.filter.goalProgress.to)
                        return partnerController.getUserAnnualGoal(usersByQuater).then(usersByGoal => {
                            return {users: usersByGoal, report}
                        })
                    })
            })
        })
        .catch(()=>{
            return[];
        })
    }

    static getActivities(users, report) {
        if (!users.length) return;
        if (!report) return users;
        let filteredActivities = ActivitiesAll.filter(act =>{
            return report.filter.activities.find((userAct)=>{
                return act.id == userAct;
            })
        });
        let dateActivity = filteredActivities.filter(act => act.dateRange).map(act => act.name);
        let todayActivity = filteredActivities.filter(act => !act.dateRange).map(act => act.name);

        return Promise.filter(users, user => {
            let promises = [];
            if(dateActivity.length) 
            promises.push(Activity.find({userId: user._id, createdAt: {$gte: report.filter.startDate, $lte: report.filter.endDate},
                title: {$in: dateActivity}}))
            if(todayActivity.length)
            promises.push(Activity.find({userId: user._id, title: {$in: todayActivity}}))
            return Promise.all(promises).then(activity => {
                if (dateActivity.length && todayActivity.length)
                    return _.uniqBy(activity[0], 'title').length == dateActivity.length && _.uniqBy(activity[1], 'title').length == todayActivity.length;
                if (dateActivity.length)
                    return _.uniqBy(activity[0], 'title').length == dateActivity.length;
                if (todayActivity.length)
                    return _.uniqBy(activity[0], 'title').length == todayActivity.length;
            })
        })
    }

    static getUsers(report) {
        let query = {};
        let coupons = [];
        let products = [];
        if (report.filter.coupons && report.filter.coupons.length)
            coupons = report.filter.coupons.map(coupon => coupon);
        if (report.filter.products && report.filter.products.length)
            products = report.filter.products.map(product => product);

        if (products.length)
            query.planId = {$in: products};
        if (coupons.length) 
            query.couponId = {$in: coupons};
        if (report.filter.status) 
            query.status = report.filter.status;
        if (!_.isUndefined(report.filter.slapStatus))
            if (report.filter.slapStatus)
                query.finishedSteps = 46;
            else query.finishedSteps = {$ne: 46};
        query.role = 4;

        if (report.filter.expert.length) 
            query.expertId = {$in: report.filter.expert};
        if (report.filter.partner.length)
            query.partnerId = {$in: report.filter.partner};
        return User.list({criteria:query}).then(users => {
            return users.map(user => {
                return user.toObject();
            })
        })
    }

    static getUsersByQuater(users, targetQuaters) {
        return Promise.filter(users, user => {
            return Mindset.find({userId: user._id})
            .then(mindset => {
                if(!mindset) return; 
                user.currentQuater = ReportController.getCurrentQuater(mindset);
                if((!targetQuaters.length || targetQuaters.length > 3) && user.currentQuater) return true;
            return ~targetQuaters.indexOf(user.currentQuater);
            })
        });       
    }

    static getCurrentQuater(mindset) {
        let quaters = [];
        if (mindset[0] && mindset[0].slapStartDate){   
            let startDate = Moment({year: mindset[0].slapStartDate.year, month: mindset[0].slapStartDate.month-1}).format('YYYY-MM-DD');
            quaters.push(Moment(startDate).format('YYYY-MM-DD'));
       
            for(let i = 0; i < 4; i++)
                quaters.push(Moment(quaters[i]).add(3, 'month').format('YYYY-MM-DD'));
            for(let i = 1; i < quaters.length; i++) {
                if (Moment().isBetween(quaters[i-1], quaters[i])) {
                    return i;
                }
            }
        } else return 0;    
    }

    static getUsersByStrategy(users, strategy) {
        return Promise.filter(usersInBuild, user => {
            return ActionPlan.findOne({userId: user._id})
            .then(plan => {
                let result = [];
                if (!plan) return;
                strategy.forEach(str => {
                    if (str == plan.whatsHappening[user.currentQuater-1].strategy.id) {
                        result.push(user);
                    }
                })
                return result.length;
            })
        })
    }

    static getUsersByPaymentStatus(users, report) {
        let titles = ['PaymentPaused', 'PaymentActivated'];
        return Promise.filter(users, user => {
            return Activity.find({userId: user._id, $or: [{title: 'PaymentPaused'}, {title: 'PaymentActivated'}]})
            .then(payments => {
                if (!payments.length)
                    return user.pausingPayment == report.filter.paymentStatus;
                let lastPay = _.maxBy(payments, 'createdAt');
                if (Moment(lastPay.createdAt).isBetween(Moment(report.filter.startDate), Moment(report.filter.endDate), 'day', []))
                    return lastPay.title == titles[report.filter.paymentStatus];
                let beforeStart = _.filter(payments, pay => {
                    return Moment(pay.createdAt).isBefore(Moment(report.filter.startDate));
                })
                if (!beforeStart.length) return false == report.filter.paymentStatus;
                let lastPayBeforeStart = _.maxBy(beforeStart, 'createdAt');
                return lastPayBeforeStart.title == titles[report.filter.paymentStatus];
            })
        })
    }

    static getUsersInBuild(users, report) {
        let usersInBuild = [];
        if (report.filter.buildStatus) 
            usersInBuild = users.filter(user => Moment(user.createdAt).isBefore(Moment().subtract(1, 'month'), 'day'))
        else usersInBuild = users.filter(user => Moment(user.createdAt).isBetween(Moment().subtract(1, 'month'), Moment(), 'day', []))
        return usersInBuild;
    }

    static getUserCharges(users, report) {
        return Promise.filter(users, user => {
            return Activity.findOne({userId: user._id, 
                title: report.filter.declinedStatus ? 'Payment Success' : 'Payment Declined',
                createdAt: {$gte: report.filter.startDate, $lte: report.filter.endDate}})
        })
    }

    static getUsersByZip(users, report) {
        return Promise.filter(users, user => {
            let countryObj = zipcodes.lookup(user.billingAddress);
            if (report.filter.country == 0) {
                
                if (countryObj)
                    return ~_.findIndex(countrys, c => {
                        return c.name == countryObj.name;
                    })
                return true;
            }
            if (countryObj)
                return countryObj.country == countrys[report.filter.country].name;
        })
    }

}

module.exports = ReportController;