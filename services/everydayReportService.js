const mongoose = require('mongoose');
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Coupon = mongoose.model('Coupon');
const Payment = mongoose.model('Payment');
const ExecuteItem = mongoose.model('ExcuteItem');
const ActionPlan = mongoose.model('ActionPlan');
const YearGoal = mongoose.model('YearGoal');
const Mindset = mongoose.model('slapMindset');
const Moment = require('moment');
const Mailer = require('../libs/class/Mailer');
const config = require('../config');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');
const Activity = mongoose.model('Activity');

let  local;

let  activityTypes = [
    { id: "Milestone", name: "Milestone", show: true },
    { id: "ActionItem", name: "ActionItem", show: true },
    { id: "Pause & Reflect", name: "Pause & Reflect", show: true },
    { id: "Sales", name: "Sales", show: true },
    { id: "Communication", name: "Communication", show: true },
    { id: "SLAPexpert", name: "SLAPexpert", show: true },
    { id: "SLAPassistant", name: "SLAPassistant", show: true },
    { id: "SLAPworld", name: "SLAPworld", show: true },
    { id: "SLAPschool", name: "SLAPschool", show: true },
    { id: "SLAPmanager", name: "SLAPmanager", show: true }
];


class everydayReportService {
    static everydayReportService() {
        console.log('Cron run');
    }

    static getActivity(userId) {
        let results = [];
        let quaters = [];
        let startDate;
        let goal = [];
        let revenues = [];

        return everydayReportService.getMindset(userId).then(function (mindset){
            startDate = Moment(mindset[0].slapStartDate).format('YYYY-MM-DD');
            quaters.push(Moment(startDate).format('YYYY-MM-DD'));
            quaters.push(Moment(quaters[0]).add(3, 'month').format('YYYY-MM-DD'));
            quaters.push(Moment(quaters[1]).add(3, 'month').format('YYYY-MM-DD'));
            quaters.push(Moment(quaters[2]).add(3, 'month').format('YYYY-MM-DD'));
            quaters.push(Moment(quaters[3]).add(3, 'month').format('YYYY-MM-DD'));


            return everydayReportService.getGoals(userId).then(function (goals){
                goal = goals.filter(gol => Moment(gol.createdAt).format('YYYY-MM-DD') == Moment().format('YYYY-MM-DD'));
                return everydayReportService.getRevenues(userId).then(function (revenue){
                    if (revenue[0]!= undefined){
                        let obj = revenue[0].revenueStreams.revenues;
                        for (var key in obj)
                        if (obj[key].deleted == false){
                            revenues.push(obj[key]);
                        }}
                        else return;
                    return everydayReportService.getUserById(userId).then(function (user){
                        for (let i = 1; i < quaters.length; i++) {
                            let obj = [];
                            for (let k = 0; k < revenues.length; k++){
                                let count = 0;
                                for (let j = 0; j < goal.length; j++) {
                                    if (Moment(goal[j].dueDate).isBetween(quaters[i-1], quaters[i], 'day', '[]') && goal[j].title == revenues[k].id){
                                        count += goal[j].saleUnit;
                                    }
                                }
                                if (count > 0) obj.push({name: user.businessName, count: count, quater: i, revenue: revenues[k].name});
                            }
                            if (obj.length > 0) results.push(obj);
                        }
                        return results;
                    })
                    })
                    
            })
        })
        // let activity = [];
        // let types = activityTypes
        //     .filter(function(type){ return type.show == true; })
        //     .map(function(type){return type.name});
        // return everydayReportService.getUserById(userId).then(function (user){
        // return Activity.list({criteria: {userId:userId}}).then(function (list){
            
        //     for (let i=0; i<list.length; i++) {
        //         let act = Moment(list[i].createdAt);
        //         if (act.isBetween(Moment().subtract(1, 'day'), Moment(), 'day', []))
        //             activity.push(list[i]);
        //     }
        //     types.forEach(function (element,index) {
        //         let count = 0;
        //         for(let i=0; i<activity.length; i++) {
        //             if(activity[i].type === element)
        //                 count++;
        //         }
        //         if (count > 0) 
        //             results.push({businessName: user.businessName, activity: element, count: count});
        //         })
        //         console.log(results);
        //         return results;
            // })
        // })
    } 

    static getUserById(userId) {
        return User.findOne({_id: userId}).exec();
    }

    static totalNumberOfAccounts() {
        return User.count({role: '4'}).exec();
    }

    static numberOfNewAccounts() {
        return User.count({role: '4', createdAt: Moment().tz('America/Los_Angeles').format('YYYY-MM-d')}).exec();
    }

    static numberOfRenewals() {
        return User.count({role: '4', createdAt: Moment().format('YYYY-MM-DD'), isRenew: true}).exec();
    }

    static numberOfDeleted() {
        return User.count({role: '4', status: 'archived'}).exec();
    }

    static numberOfAccountsInBuild() {
        return User.count({role: '4', status: 'active'}).where("finishedSteps <> '46'").exec();
    }

    static numberOfAccountsInExecute() {
        return User.count({role: '4', status: 'active'}).where("finishedSteps == '47'").exec();
    }

    // all sales of user
    static getGoals(userId) {
        return ExecuteItem.find({userId: userId, type: 'sales'}).exec();
    }
    
    // all user goals 
    static getTotalGoals(userId) {
        return ActionPlan.find({userId: userId}).exec();
    }

    // all user 
    static getRevenues(userId) {
        return YearGoal.find({userId: userId}).exec();
    }

    static getUserId() {
        return User.find({role: '4'}).exec();
    }

    static getNoLogged() {
        let dateDiff = Moment().tz('America/Los_Angeles').format('MMMM d, YYYY');
    }

    static getMindset(userId) {
        return Mindset.find({userId: userId}).exec();
    }

    static getAnnualGoals(userId) {
        let count = 0;
        let goals = [];
        let totalGoals = 0; 
        let revenues = [];
        let sum = 0;
        return everydayReportService.getGoals(userId).then(function (goal){
            goals = goal.filter(gol => gol.type == 'sales' && gol.progress == 100);
                return everydayReportService.getRevenues(userId).then(function (revenue){
//			console.log(JSON.stringify(revenue[0].revenueStreams.revenues, null, 3));
                    if (revenue[0] != undefined) {
                        let obj = revenue[0].revenueStreams.revenues;
                        for (var key in obj) {
                            if (obj[key].deleted == false) {
                                revenues.push(obj[key]);
                            }
                        }
                    } else {
                        return;
                    }

//			console.log(JSON.stringify(revenues, null, 3));
                    
                    return everydayReportService.getTotalGoals(userId).then(function (totalGoal){
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
//				console.log(JSON.stringify(goals, null, 3));
                            for(let i=0; i<goals.length; i++) {
				if (revenues[goals[i].title-1]) {
                                sum = (+goals[i].saleUnit * revenues[goals[i].title-1].sellingPrice) + sum;
				}
                            }
                        if ((sum/totalGoals) * 100 >=75) count++;
			}

                        return count;
                    })
                })
        })
    }

    static getQuaterlyGoals(userId) {
        let count = 0;
        let goals = [];
        let quaters = [];
        let startDate = [];
        let revenues = [];
        
        return everydayReportService.getGoals(userId).then(function (goal){
            goals = goal.filter(gol => gol.type == 'sales' && gol.progress == 100);
                return everydayReportService.getRevenues(userId).then(function (revenue){
                    if (revenue[0] != undefined){
                        let obj = revenue[0].revenueStreams.revenues;
                        for (var key in obj)
                            if (obj[key].deleted == false){
                           
                            revenues.push(obj[key]);}
                            }
                    else return;
                    return everydayReportService.getMindset(userId).then(function (mindset){
                        startDate = Moment(mindset[0].slapStartDate).format('YYYY-MM-DD');
                        quaters.push(Moment(startDate).format('YYYY-MM-DD'));
                        quaters.push(Moment(quaters[0]).add(3, 'month').format('YYYY-MM-DD'));
                        quaters.push(Moment(quaters[1]).add(3, 'month').format('YYYY-MM-DD'));
                        quaters.push(Moment(quaters[2]).add(3, 'month').format('YYYY-MM-DD'));
                        quaters.push(Moment(quaters[3]).add(3, 'month').format('YYYY-MM-DD'));
                        return everydayReportService.getTotalGoals(userId).then(function (totalGoal){
                            let el = 0;
                            let totalGoals = []; 
                            if (totalGoal && totalGoal.length > 0 && totalGoal[0].whatsHappening) {
                                for (let i=0; i<totalGoal[0].whatsHappening.length; i++) {
                                    
                                    let sum = 0;
                                    if (totalGoal[0].whatsHappening[i].units) {
                                    Object.keys(totalGoal[0].whatsHappening[i].units).forEach(function (element, index){
                                        if (revenues[index].name == element) 
                                            el = revenues[index].sellingPrice;
                                        sum = ((+totalGoal[0].whatsHappening[i].units[element] * el) + sum);
                                    })
                                    totalGoals.push(sum);
                                }
                            }
                                for(let i=0; i<goals.length; i++) {
                                    let sum = 0;
                                    let totalSum = [];
                            
                                    for(let j=1; j<quaters.length; j++) {
                                        

                                            if(Moment(goals[i].dueDate).isBetween(quaters[j-1], quaters[j], 'day', '[]')){
                                            if (revenues[goals[i].title-1]) 
                                                sum = (+goals[i].saleUnit * revenues[goals[i].title-1].sellingPrice) + sum;
                                            }
                                        totalSum.push(sum);
                                    
                                    if ((totalSum[i]/totalGoals[i]) * 100 >=75) count++;
                                    
                                }
                                }
                            }
                            return count;
                    })
                })
            })
        })
    }

    static getUserNotes(userId) {
        return everydayReportService.getUserById(userId).then(function (user){
            if (user.extrainfo.textNotes != '') return {name: user.name + '' + user.lastName, businessName: user.businessName, notes: user.extrainfo.textNotes}
        })
    }

    

    static getLocalVariables() {
        return everydayReportService.totalNumberOfAccounts().then(function (numberOfUsers){
            return everydayReportService.numberOfNewAccounts().then(function (newUsers){
                return everydayReportService.numberOfRenewals().then(function (numberOfRenewals){
                    return everydayReportService.numberOfDeleted().then(function (numberOfDeleted){
                        return everydayReportService.numberOfAccountsInBuild().then(function (numberOfAccountsInBuild){
                            return everydayReportService.numberOfAccountsInExecute().then(function (numberOfAccountsInExecute){
                                return everydayReportService.getUserId().then(function (users){
                                        let results = [];
                                        for (let i = 0; i < users.length; i++) {
                                            results.push(everydayReportService.getAnnualGoals(users[i]._id));
                                        }
                                        return Promise.all(results).then(function(countsAnnual){
                                            let results = [];
                                            for (let i = 0; i < users.length; i++) {
                                                results.push(everydayReportService.getQuaterlyGoals(users[i]._id));
                                            }
                                            return Promise.all(results).then(function(countsQuaterly){
                                                let results = [];
                                                for (let i = 0; i < users.length; i++) {
                                                    results.push(everydayReportService.getActivity(users[i]._id));
                                                }
                                                return Promise.all(results).then(function (clientActivity){
                                                    let client = [];
                                                    let res = [];
                                                    for (let i = 0; i < clientActivity.length; i++) 
                                                        clientActivity[i].forEach(function (element, index){
                                                            client.push(element);
                                                        })
                                                    for (let i = 0; i < client.length; i++)
                                                        client[i].forEach(function (element, index) {
                                                            
                                                            res.push(element);
                                                        })
                                                    let results = [];
                                                    for (let i = 0; i < users.length; i++) {
                                                        results.push(everydayReportService.getUserNotes(users[i]._id));
                                                    }
                                                    return Promise.all(results).then(function (notes){
                                                        local = {
                                                            numberOfUsers: numberOfUsers,
                                                            newUsers: newUsers,
                                                            numberOfRenewals: numberOfRenewals,
                                                            numberOfDeleted: numberOfDeleted,
                                                            numberOfAccountsInBuild: numberOfAccountsInBuild,
                                                            numberOfAccountsInExecute: numberOfAccountsInExecute,
                                                            annualHitting: countsAnnual.reduce((acc, cur) => acc + cur, 0),
                                                            quaterlyHitting: countsQuaterly.reduce((acc, cur) => acc + cur, 0),
                                                            clientActivity: res,
                                                            notes: notes
                                                        };
                                                    everydayReportService.renderTemplate(local);
                                                    })
                                                })
                                            })
                                        })
                                })
                                            
                            })
                        })
                    })
                });
            });
        });
    }

    static send(subject, htmlContent, textContent) {
        let smtpConfig = nodemailer.createTransport({
            host: config.AWS_SMTP.region,
            port: 465,
            secure: true,
            auth: {
                user: config.AWS_SMTP.username,
                pass: config.AWS_SMTP.password,
            }
        });
        smtpConfig.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });

        let mailOptions = {
            from:  config.emailAddressSupport,
            to: 'carissa@smallbizsilverlining.com, jon@smallbizsilverlining.com', // email
            subject: 'Daily Report', // Subject line
            text: "Hello! It's a Daily Report message!", // plain text body
            html: htmlContent // html body
        };

        return new Promise((resolve, reject) => {
            return smtpConfig.sendMail(mailOptions,
                (err,result) => {
                    smtpConfig.close();

                    if(err) {
                        console.log(err); // TODO: winston logger add;
                        return reject(new Error('Failed to send email'));
                    }
                    return resolve(result);
                }); 
        });
    }

    static renderTemplate(local) {
        let template = new EmailTemplate(path.join(__dirname, '../emailtemplates', 'daily-report'));
        // everydayReportService.getLocalVariables()
            // let speakersWithWebinar = speakers.filter(speaker => speaker.enable_webinar);
        // everydayReportService.totalNumberOfAccounts();
        //console.log(Moment().tz('America/Los_Angeles').format('YYYY-MM-d'));
        if(!template){
            // TODO create promise to send errors back;
            return new Promise((resolve, reject) => {
                reject("Error in Rendering template");
            });
        } else {
            return template.render(local)
            .then(function (results) {
                //console.log(results);
                return everydayReportService.send(results.subject, results.html, results.text);
            });
        }
    }
}

module.exports = everydayReportService;
