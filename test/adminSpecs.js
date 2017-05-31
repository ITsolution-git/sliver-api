let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app.js');
let db = require('../libs/mongoose');
let mockData = require('./mockData');
let config = require('./../config');
const jwt = require('jsonwebtoken');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let rootUrl = '/admin';

describe('Admin ', function() {
    let user = mockData.users[0];

    let token = jwt.sign(user, config.secret, {
        expiresIn: '24h'
    });

    before('Remove mock users from database', function(done) {
        db.model('User').remove({}, function(err) {
            done();
        });
    });

    before('Insert users from mock data', function(done) {
        db.model('User').collection.insert(mockData.users, {}, function(err) {
            done();
        });
    });

    describe('Authentication ', function() {
        it('Should auth as an Admin', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/auth')
                .send(mockData.users[0])
                .end(function(err, res) {
                    res.body.should.have.property('token');

                    done();
                });
        });
    });

    describe('Products ', function() {
        let products = mockData.products;

        let product = products[0];

        let productToCreate = products.pop();

        before('Remove mock products from database', function(done) {
            db.model('Product').remove({}, function(err) {
                done();
            });
        });

        before('Insert products from mock data', function(done) {
            db.model('Product').collection.insert(products, {}, function(err) {
                done();
            });
        });

        it('Should create a product', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/products')
                .set('authorization', 'BEARER ' + token)
                .send(productToCreate)
                .end(function(err, res) {
                    res.body._id.should.equal(productToCreate._id.toString());
                    done();
                });
        });

        it('Should get products', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/products')
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    res.body.should.have.lengthOf(3);
                    done();
                });
        });

        it('Should get a product with the id', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/products/' + product._id)
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    res.body._id.should.equal(product._id.toString());
                    done();
                });
        });

        it('Should update a product with the id', function(done) {
            chai
                .request(app)
                .put(rootUrl + '/products/' + product._id)
                .set('authorization', 'BEARER ' + token)
                .send({ name: 'Updated name' })
                .end(function(err, res) {
                    res.body.name.should.equal('Updated name');
                    done();
                });
        });

        it('Should delete a product with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/products/' + product._id)
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    done();
                });
        });
    });

    describe('Plans ', function() {

        it('Should get plans', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/plans')
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    done();
                });
        });
    });

    describe('Coupons ', function() {

        let coupons = mockData.coupons;

        let coupon = coupons[0];

        let couponToCreate = coupons.pop();

        it('Should create a coupon', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/coupons')
                .set('authorization', 'BEARER ' + token)
                .send(couponToCreate)
                .end(function(err, res) {
                    res.body._id.should.equal(couponToCreate._id.toString());
                    done();
                });
        });

        it('Should get coupons', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/coupons')
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    res.body.should.have.lengthOf(3);
                    done();
                });
        });

        it('Should get a coupon with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/coupons/' + coupon._id)
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    res.body._id.should.equal(coupon.toString());
                    done();
                });
        });

        it('Should update a coupon with the id', function(done) {
            chai
                .request(app)
                .put(rootUrl + '/coupons/' + coupon._id)
                .set('authorization', 'BEARER ' + token)
                .send({ name: 'Awesome coupon' })
                .end(function(err, res) {
                    res.body.name.should.equal('Awesome coupon');
                    done();
                });
        });

        it('Should delete a coupon with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/coupons/' + coupon._id)
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    db.model('Coupon').findById(coupon._id, function(err, doc) {
                        expect(doc).to.not.exist;
                        done();
                    });
                });
        });
    });

    describe('Financial tracker ', function() {

/*TODO: Implement after double checking the billing logic  */        
        it('Should get payments', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/financialTracker')
                .set('authorization', 'BEARER ' + token)
                .end(function(err, res) {
                    done();
                });
        });
    });
});
