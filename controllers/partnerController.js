const mongoose = require('mongoose');
const Partner = mongoose.model('Partner');
const stripe = require('../services/stripe');
const StripeService = stripe.service;
const moment = require('moment');
class PartnerController {

    static create(req) {

        let partner = req.body;
        return (new Partner(partner)).save();
    
    }

    static getPartners() {
        return Partner.list();
    }

    static getPartner(req) {
        return Partner.load({ _id: req.params.id });
    }

    static update(req) {
        return Partner.findOneAndUpdate({ _id: req.params.id }, req.body);
    }

    static remove(req) {
        return Partner.findOneAndRemove({ _id: req.body._id })
    }

    
}

module.exports = PartnerController;