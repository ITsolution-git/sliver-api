const mongoose = require('mongoose');
const Report = mongoose.model('Report');

class ReportController {
    
    static create(req) {
        let report = req.body;
        
        return (new Report(report)).save();
    }

    static getReports() {
        return Report.list();
    }

    static getReport(req) {
       return Report.load({_id: req.params.id});
    }

    static update(req) {
       return Report.findOneAndUpdate({_id: req.params.id}, req.body);
    }

    static remove(req) {
        return Report.findOneAndRemove({_id: req.body._id});
    }

    static runReport(req) {
        return ReportController.run(req.params.id);
    }

    static run(report_id) {
        
    }
}

module.exports = ReportController;