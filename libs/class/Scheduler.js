const schedule = require('node-schedule');
const PaymentTime = require('../jobs/PaymentTime');
const zoomController = require('../../controllers/zoomController');

class Scheduler {

    static run() {
        return schedule.scheduleJob({hour: 1, minute: 30}, () => {
            return PaymentTime.payment();
        });
    }

    static runZoomJob(){
        return schedule.scheduleJob('00 15 * * * *', () => {
            console.log('ZOOM CRON STARTED');
           return zoomController.getWebinars();
        });
    }

}

module.exports = Scheduler;


/*
 Are you sure about change this promo code?
 This promo code has already been applied to other SLAPlan

 */