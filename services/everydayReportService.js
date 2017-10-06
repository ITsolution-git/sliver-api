const mongoose = require('mongoose');
const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Coupon = mongoose.model('Coupon');
const Payment = mongoose.model('Payment');
const ExecuteItem = mongoose.model('ExcuteItem');
const ActionPlan = mongoose.model('ActionPlan');
const YearGoal = mongoose.model('YearGoal');
const Moment = require('moment');
const Mailer = require('../libs/class/Mailer');
const config = require('../config');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');

let  local;



class everydayReportService {
    static everydayReportService() {
        console.log('Cron run');
    }

    static totalNumberOfAccounts() {
        return User.count({role: '4'}).exec();
    }

    static numberOfNewAccounts() {
        return User.count({role: '4', createdAt: Moment().tz('America/Los_Angeles').format('YYYY-MM-d')}).exec();
    }

    static numberOfRenewals() {
        return User.count({role: '4'}).exec();
    }

    static numberOfDeleted() {
        return User.count({role: '4', status: 'deleted'}).exec();
    }

    static numberOfAccountsInBuild() {
        return User.count({role: '4', status: 'active'}).where("finishedSteps <> '47'").exec();
    }

    static numberOfAccountsInExecute() {
        return User.count({role: '4', status: 'active'}).where("finishedSteps == '47'").exec();
    }

    // all sales of user
    static getGoals(userId) {
        return ExecuteItem.find({userId: userId}).exec()
        // .then(function (Execute) {
        //     Execute.forEach(function (element, index) {
        //         if ((element.type == 'sales') && (element.progress == 100))
        //         return items[index]=element;
        //     })
        // })
    }
    
    // all user goals 
    static getTotalGoals(userId) {
        return ActionPlan.find({userId: userId}).exec();
        //.then(function (Action) {
           // Object.keys(Action[0].whatsHappening[0].units).forEach(function (element, index) {
           //     return sum = +Action[0].whatsHappening[0].units[element] + sum;
           // })
       // })
    }

    // all user 
    static getRevenues(userId) {
        return YearGoal.find({userId: userId}).exec();
        // .then(function (Revenue) {
        //     if (!Revenue[0].revenueStreams.deleted)
        //     return items=Revenue[0].revenueStreams;
        // })
    }

    static getUserId() {
        return User.find({role: '4'}).exec();
    }

    static getNoLogged() {
        let dateDiff = Moment().tz('America/Los_Angeles').format('MMMM d, YYYY');
        console.log(dateDiff);
    }

    // static getQuaterlyGoals() {
    //     return everydayReportService.getUserId(function (user) {
    //         everydayReportService.getGoals(user.id)
    //     })
    // }



    static getAnnualGoals(userId) {
        let count = 0;
        let goals = [];
        let totalGoals = 0; 
        let revenues = [];
        let sum = 0;
        return everydayReportService.getGoals(userId).then(function (goal){
            goals = goal.filter(gol => gol.type == 'sales' && gol.progress == 100);
                return everydayReportService.getRevenues(userId).then(function (revenue){
                    if (revenue[0].revenueStreams!= undefined){
                        let obj = revenue[0].revenueStreams.revenues;
                        for (var key in obj)
                        if (obj[key].deleted == false){
                            revenues.push(obj[key]);
                        }}
                    
                    return everydayReportService.getTotalGoals(userId).then(function (totalGoal){
                        let el = 0;
                            for (let i=0; i<4; i++) {
                                Object.keys(totalGoal[0].whatsHappening[i].units).forEach(function (element, index){
                                    for (let i=0; i<revenues.length; i++) {
                                        if (revenues[i].name == element) 
                                            el = revenues[i].sellingPrice;}
                                    totalGoals = (+totalGoal[0].whatsHappening[i].units[element] * el) + totalGoals;
                                })
                            }
                            for(let i=0; i<goals.length; i++) {
                                sum = (+goals[i].saleUnit * revenues[goals[i].title-1].sellingPrice) + sum;
                            }
                        if ((sum/totalGoals) * 100 >=75) count++;

                        return count;
                    })
                })
            })
    }

    static getQuaterlyGoals(userId) {
        let count = 0;
        let goals = [];
        
        let revenues = [];
        
        return everydayReportService.getGoals(userId).then(function (goal){
            goals = goal.filter(gol => gol.type == 'sales' && gol.progress == 100);
                return everydayReportService.getRevenues(userId).then(function (revenue){
                    if (revenue[0].revenueStreams!= undefined){
                        let obj = revenue[0].revenueStreams.revenues;
                        for (var key in obj)
                            if (obj[key].deleted == false){
                           
                            revenues.push(obj[key]);}
                        }
                    
                    return everydayReportService.getTotalGoals(userId).then(function (totalGoal){
                        let el = 0;
                            for (let i=0; i<4; i++) {
                                let totalGoals = 0; 
                                let sum = 0;
                                Object.keys(totalGoal[0].whatsHappening[i].units).forEach(function (element, index){
                                    if (revenues[index].name == element) 
                                        el = revenues[index].sellingPrice;
                                    totalGoals = (+totalGoal[0].whatsHappening[i].units[element] * el) + totalGoals;
                                })
                                for(let i=0; i<goals.length; i++) {
                                    // need to do a check "What quater is it?"
                                    sum = (+goals[i].saleUnit * revenues[goals[i].title-1].sellingPrice) + sum;
                                }
                                if ((sum/totalGoals) * 100 >=75) count++;
                            }

                        return count;
                    })
                })
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
                                            console.log(users[i]._id);
                                            results.push(everydayReportService.getAnnualGoals(users[i]._id));
                                        }
                                        return Promise.all(results).then(function(countsAnnual){
                                            let results = [];
                                            for (let i = 0; i < users.length; i++) {
                                                console.log(users[i]._id);
                                                results.push(everydayReportService.getQuaterlyGoals(users[i]._id));
                                            }
                                            return Promise.all(results).then(function(countsQuaterly){
                                            local = {
                                            numberOfUsers: numberOfUsers,
                                            newUsers: newUsers,
                                            numberOfRenewals: numberOfRenewals,
                                            numberOfDeleted: numberOfDeleted,
                                            numberOfAccountsInBuild: numberOfAccountsInBuild,
                                            numberOfAccountsInExecute: numberOfAccountsInExecute,
                                            annualHitting: countsAnnual.reduce((acc, cur) => acc + cur, 0),
                                            quaterlyHitting: countsQuaterly.reduce((acc, cur) => acc + cur, 0)
                                        };
                                        everydayReportService.renderTemplate(local);
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
            host: 'smtp.mail.ru', // host: config.AWS_SMTP.region,
            port: 465,
            secure: true,
            auth: {
                user: 'fucking-flower@mail.ru', //user: config.AWS_SMTP.username,
                pass: 'A440195667'  //pass: config.AWS_SMTP.password,
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
            from:  '<fucking-flower@mail.ru>', // config.emailAddressAdmin
            to: 'dpcarnage86@gmail.com', // email
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
        console.log(local);
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