let mongoose = require('mongoose');
let config = require('./config.js');
const fs = require('fs');
const join = require('path').join;
const Promise = require('bluebird');
mongoose.Promise = require('bluebird');
// mongoose.connect(config.db); 
const models = join(__dirname, 'models/mongoose');
// Bootstrap models 
fs.readdirSync(models)
    .filter((file) => ~file.search(/^[^\.].*\.js$/))
    .forEach((file) => {
        // console.log(join(models, file)); 
        require(join(models, file));
    });
const stripe = require('stripe')(config.stripe_key);
const User = mongoose.model('User');
stripe.customers.list({ limit: 100 }).then((list) => {
    return list.data.map((elem) => {
        return {
            email: elem.email,
            stripeId: elem.id,
            stripeSource: elem.default_card,
            subscriptions: elem.subscriptions
        }
    })
}).then(customers => {
    return stripe.customers.list({ limit: 100, starting_after: customers[99].stripeId }).then((list) => {
        return list.data.map((elem) => {
            return {
                email: elem.email,
                stripeId: elem.id,
                stripeSource: elem.default_card,
                subscriptions: elem.subscriptions
            }
        }).concat(customers);
    })
}).then(customers => {
    return stripe.customers.list({ limit: 100, starting_after: customers[99].stripeId }).then((list) => {
        return list.data.map((elem) => {
            return {
                email: elem.email,
                stripeId: elem.id,
                stripeSource: elem.default_card,
                subscriptions: elem.subscriptions
            }
        }).concat(customers);
    })
}).then(customers => {
    return stripe.customers.list({ limit: 100, starting_after: customers[99].stripeId }).then((list) => {
        return list.data.map((elem) => {
            return {
                email: elem.email,
                stripeId: elem.id,
                stripeSource: elem.default_card,
                subscriptions: elem.subscriptions
            }
        }).concat(customers);
    })
}).then(customers => {
    return stripe.customers.list({ limit: 100, starting_after: customers[99].stripeId }).then((list) => {
        return list.data.map((elem) => {
            return {
                email: elem.email,
                stripeId: elem.id,
                stripeSource: elem.default_card,
                subscriptions: elem.subscriptions
            }
        }).concat(customers);
    })
}).then(customers => {
    return stripe.customers.list({ limit: 100, starting_after: customers[99].stripeId }).then((list) => {
        return list.data.map((elem) => {
            return {
                email: elem.email,
                stripeId: elem.id,
                stripeSource: elem.default_card,
                subscriptions: elem.subscriptions
            }
        }).concat(customers);
    })
}).then((result) => {
    console.log('here');
    return Promise.each(result, (elem) => {
        if (elem.subscriptions.data.length > 1) {
            console.log(JSON.stringify(elem.subscriptions.data, null, 3));
        }
        return User.findOneAndUpdate({email: elem.email}, {
            stripeId: elem.stripeId,
            stripeSource: elem.stripeSource,
            stripeSubscription: elem.subscriptions.data.length ? elem.subscriptions.data[0].id : null
        });
    })

}) 