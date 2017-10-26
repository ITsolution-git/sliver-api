module.exports = function(app) {
    const schedule = require('../libs/class/Scheduler');
    const dashboard = require('./dashboard');
    const admin = require('./admin');
    const config = require('../config');

    // schedule.run();
    schedule.runZoomJob();

    if (config.reports.adminDailyReport) {
        schedule.runReportJob();
    }

    app.use('/v1', dashboard);
    app.use('/admin', admin);
};