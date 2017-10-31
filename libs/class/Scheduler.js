const schedule = require('node-schedule');
const PaymentTime = require('../jobs/PaymentTime');
const zoomController = require('../../controllers/zoomController');
const EverydayReportService = require('../../services/everydayReportService');
const Stripe = require('../../services/stripe/StripeService');

class Scheduler {

    static runPayments() {
        return schedule.scheduleJob({hour: 1, minute: 30}, () => {
            return PaymentTime.payment();
        });
    }

    static updateSubscriptions() {
        return schedule.scheduleJob('5 45 19 * * *', () => {
            console.log('CRON: checking subscriptions');
            Stripe.updateSubscriptions().then(() => {
                console.log("Checking completed");
            });
        });
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

}

module.exports = Scheduler;


/*
 Are you sure about change this promo code?
 This promo code has already been applied to other SLAPlan

 */
