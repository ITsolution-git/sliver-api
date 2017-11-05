module.exports = function(app) {
    const schedule = require('../libs/class/Scheduler');
    const dashboard = require('./dashboard');
    const admin = require('./admin');
    const config = require('../config');

    // schedule.runPayments();
    schedule.runZoomJob();
    schedule.updateSubscriptions();
    schedule.runExpertReport();
    schedule.runPartnerReport();

    if (config.reports.adminDailyReport) {
        schedule.runReportJob();
    }

    app.use('/v1', dashboard);
    app.use('/admin', admin);
};