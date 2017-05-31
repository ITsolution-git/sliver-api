const config = require('../../config');
const StripeError  = require('./errors/StripeError');
const stripe = require('stripe')(config.stripe_key);

class Stripe {

    static createCustomer(userData) {
        return new Promise( (resolve,reject) => {
            Stripe._createCard(userData.card)
                .then((cardSource) => Stripe._createCustomer(cardSource,userData))
                .then(resolve)
                .catch(reject);
        });
    }
    
    static _createCustomer(cardSource,userData) {
        return new Promise( (resolve,reject) => {
            let data = {
                source : cardSource.id,
                email : userData.email,
                metadata : {
                    customer_email : userData.email,
                    customer_name : userData.name
                }
            };
           stripe.customers.create(data, (err,customer) => {
               return err ? reject(new StripeError('Failed create customer', 'BAD_DATA', {orig: err})) : resolve(customer);
           });
        });
    }

    static _createCard(card) {
        return new Promise( (resolve,reject) => {
            resolve( {
                "id" : "card_1ALBKEIpmN0dayvfuxRhfDwh"
            } );
        })
        card.exp_month = card.date.substring(0,2);
        card.exp_year = card.date.substring(2,6);

        delete card.date;        
        
        return new Promise( (resolve,reject) => {
            stripe.tokens.create({card : card}, (err,token) => {
                
                return err ? reject(new StripeError('Failed create card', 'BAD_DATA', {orig: err.stack})) : resolve(token);
            });
        });
    }
    
    static createCharges(customer,amount) {
        return new Promise((resolve,reject) => {
            stripe.charges.create({
                amount: amount,
                currency: 'usd',
                source: customer.default_source ? customer.default_source : customer.stripeSource,
                customer: customer.stripeId ? customer.stripeId : customer.id
            }, (err,result) => {
                return err ? reject(new StripeError('Failed create charges', 'BAD_DATA', {orig: err.stack})) : resolve(result);
            });
        });
    }
    
    static getCustomerById(id) {
        return new Promise((resolve,reject) => {
            stripe.customers.retrieve(id, (err,result) => {
                return err ? reject(new StripeError('Failed create charges', 'BAD_DATA', {orig: err.stack})) : resolve(result);
            })
        })
    }
}

module.exports = Stripe;