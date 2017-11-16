const mongoose = require('mongoose');
const User = mongoose.model('User');
const Mindset = mongoose.model('slapMindset');
const Moment = require('moment');
const Mailer = require('../libs/class/Mailer');
const config = require('../config');
const smtpTransport = require('nodemailer-smtp-transport');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');
const Activity = mongoose.model('Activity');
const Promise = require('bluebird');

let  local;



class userReportService {
    static userReportService() {
        console.log('Cron run');
    }

    static notLogged(users) {
        return Promise.map(users, user => {
            if (user.lastLogin && Moment(user.lastLogin).isBefore(Moment().subtract(14, 'day')))
                return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, {user: user}, 'user-report')
        })
    }

    static slapbuddy(users) {
        return Promise.map(users, user => {
            return Mindset.find({userId: user._id}).then(function (mindset){
                let quaters = [];
                if (mindset[0] && mindset[0].slapStartDate){   
                    let startDate = Moment({year: mindset[0].slapStartDate.year, month: mindset[0].slapStartDate.month-1}).format('YYYY-MM-DD');
                    quaters.push(Moment(startDate).format('YYYY-MM-DD'));
                    quaters.push(Moment(quaters[0]).add(3, 'month').format('YYYY-MM-DD'));
                    quaters.push(Moment(quaters[1]).add(3, 'month').format('YYYY-MM-DD'));
                    quaters.push(Moment(quaters[2]).add(3, 'month').format('YYYY-MM-DD'));
                    quaters.push(Moment(quaters[3]).add(3, 'month').format('YYYY-MM-DD'));
                    if (Moment().isSame(quaters[1], 'day'))
                        return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, {user: user}, 'SLAPbuddy')
                    else if (Moment().isSame(quaters[3], 'day'))
                        return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, {user: user}, 'user-starts-q4')
                    else if ((Moment().isSame(Moment(quaters[3]).add(1, 'month'), 'day')))
                        return Mailer.renderTemplateAndSend(config.emailAdressSmallSupport, {user: user}, 'renewal-needs')
                }
                return false;
            })
        })
    }

    static create() {
        return User.find({role: 4})
        .then(users => {
            return Promise.all([userReportService.notLogged(users), userReportService.slapbuddy(users)])
        })
    }
   
}

module.exports = userReportService;
