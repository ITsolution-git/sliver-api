const schedule = require('node-schedule');
const PaymentTime = require('../jobs/PaymentTime');
const zoomController = require('../../controllers/zoomController');
const EverydayReportService = require('../../services/everydayReportService');
const Stripe = require('../../services/stripe/StripeService');
const ExpertReport = require('../../services/expertReportService');
const PartnerReport = require('../../services/partnerReportService');
const UserReport = require('../../services/userReportService');

class Scheduler {

    static runPayments() {
        return schedule.scheduleJob({hour: 1, minute: 30}, () => {
            return PaymentTime.payment();
        });
    }

    static updateSubscriptions() {
        return schedule.scheduleJob('10 10 7 * * *', () => {
            console.log('CRON: checking subscriptions');
            Stripe.updateSubscriptions().then(() => {
                console.log("Checking completed");
            });
        });
    }

    static runExpertReport() {
        return schedule.scheduleJob('20 36 * * * *', () => {
            console.log('CRON: everyday expert report');
            ExpertReport.create().then(() => {
                console.log('Expert report created');
            })
        })
    }

    static runPartnerReport() {
        return schedule.scheduleJob('30 13 17 * * *', () => {
            console.log('CRON: everyday partner report');
            PartnerReport.create().then(() => {
                console.log('Partner report created');
            })
        })
    }

    static runZoomJob(){
        return schedule.scheduleJob('00 00 12 * * *', () => {
            console.log('ZOOM CRON STARTED');
            return zoomController.getWebinars();
        });
    }

    static runReportJob(){
        return schedule.scheduleJob('0 1 7 * * *', () => {
            console.log('REPORT CRON STARTED');
            return EverydayReportService.getLocalVariables();
        });
    }

    static runUserCredentialsJob(){
        return schedule.scheduleJob('0 10 7 * * *', () => {
            console.log('USER CRON STARTED');
            return UserReport.create();
        })
    }

}

module.exports = Scheduler;


/*
 Are you sure about change this promo code?
 This promo code has already been applied to other SLAPlan

 */
