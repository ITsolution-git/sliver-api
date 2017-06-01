const schedule = require('node-schedule');
const PaymentTime = require('../jobs/PaymentTime');

class Scheduler {

    static run() {
        PaymentTime.payment();
        return schedule.scheduleJob({hour: 1, minute: 30}, () => {
            return PaymentTime.payment();
        });
    }

}

module.exports = Scheduler;


/*
 Are you sure about change this promo code?
 This promo code has already been applied to other SLAPlan

 */