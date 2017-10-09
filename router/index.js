module.exports = function(app) {
    const schedule = require('../libs/class/Scheduler');
    const dashboard = require('./dashboard');
    const admin = require('./admin');

    // schedule.run();
    schedule.runZoomJob();
    schedule.runReportJob();
    app.use('/v1', dashboard);

    app.use('/admin', admin);
};