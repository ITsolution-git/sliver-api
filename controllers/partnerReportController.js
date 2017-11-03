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

class partnerReportController {

    static create(req){
        let report = req.body;
        return partnerReportController.getUsersAssignedToPartner(req.body.partnerId)
        .then(users => {
            report.countAssignedUsers = users.length;
            return partnerReportController.getUsersByPlan(users)
            .then(obj => {
                return partnerReportController.getTotalIncome(users, req.body.from, req.body.to)
            })
        })
    }

    static getUsersAssignedToPartner(partnerId) {
        return User.find({partnerId: partnerId, stripeSubscription: {$ne: null}});         
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

    static getTotalIncome(users, from, to) {
        let rev = [];
        let goal = [];
        return Promise.map(users, element => {
            return ExecuteItem.find({userId: element._id, type: 'sales'})
            .then(goals => {
                goal = goals.filter(gol => gol.progress == 100);
                return YearGoal.find({userId: element._id})
                
            }).then(revenues => {
                if (revenues[0]){ //if (revenue[0] != undefined){
                    let obj = revenues[0].revenueStreams.revenues;
                    for (var key in obj)
                        if (obj[key].deleted)
                        revenues.splice(obj[key], revenues.indexOf(obj[key]));
                }
                else return;
                rev = revenues;
                return ActionPlan.find({userId: element._id})
            }).then(totalGoal => {
                if (totalGoal && totalGoal.length > 0 && totalGoal[0].whatsHappening) {
                    for (let i = 0; i < totalGoal[0].whatsHappening.length; i++) {
                        let sum = 0;
                        if (totalGoal[0].whatsHappening[i].units) {
                        Object.keys(totalGoal[0].whatsHappening[i].units).forEach((element, index) =>{
                            if(rev[index]) {
                                if (rev[index].name == element) 
                                    el = rev[index].sellingPrice;
                                sum = ((+totalGoal[0].whatsHappening[i].units[element] * el) + sum);
                            }
                        })
                        totalGoals.push(sum);
                        }
                    }
                    let sum = 0;
                    for(let i=0; i < goal.length; i++) {
                        if(Moment(goal[i].dueDate).isBetween(from, to, 'day', '[]')){
                            if (rev[goal[i].title-1]) 
                                sum = (+goal[i].saleUnit * rev[goal[i].title-1].sellingPrice) + sum;
                        }
                    }
                    return sum;
                } else return 0;
                
            })
            
        })
    }

}



module.exports = partnerReportController;