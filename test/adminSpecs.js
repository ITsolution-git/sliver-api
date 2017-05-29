let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app.js');
let should = chai.should();

chai.use(chaiHttp);

let rootUrl = '/admin';

describe('Admin ', function() {
	
    describe('Authentication ', function() {
        it('Should auth as an Admin', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/auth')
                .send({})
                .end(function(err, res) {
                    done();
                });
        });
    });

    describe('Products ', function() {

        let id = '1234';

        it('Should create a product', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/products')
                .send({})
                .end(function(err, res) {
                    done();
                });
        });

        it('Should get products', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/products')
                .end(function(err, res) {
                    done();
                });
        });

        it('Should get a product with the id', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/products/' + id)
                .end(function(err, res) {
                    done();
                });
        });

        it('Should update a product with the id', function(done) {
            chai
                .request(app)
                .put(rootUrl + '/products/' + id)
                .send({})
                .end(function(err, res) {
                    done();
                });
        });

        it('Should delete a product with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/products/' + id)
                .end(function(err, res) {
                    done();
                });
        });
    });

    describe('Plans ', function() {
        it('Should get plans', function(done) {
            chai.request(app).get(rootUrl + '/plans').end(function(err, res) {
                done();
            });
        });
    });

    describe('Coupons ', function() {

        let id = '1234';

        it('Should create a coupon', function(done) {
            chai
                .request(app)
                .post(rootUrl + '/coupons')
                .send({})
                .end(function(err, res) {
                    done();
                });
        });

        it('Should get coupons', function(done) {
            chai.request(app).get(rootUrl + '/coupons').end(function(err, res) {
                done();
            });
        });

        it('Should get a coupon with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/coupons/' + id)
                .end(function(err, res) {
                    done();
                });
        });

        it('Should update a coupon with the id', function(done) {
            chai
                .request(app)
                .put(rootUrl + '/coupons/' + id)
                .send({})
                .end(function(err, res) {
                    done();
                });
        });

        it('Should delete a coupon with the id', function(done) {
            chai
                .request(app)
                .delete(rootUrl + '/coupons/' + id)
                .end(function(err, res) {
                    done();
                });
        });
    });

    describe('Financial tracker ', function() {
        it('Should get payments', function(done) {
            chai
                .request(app)
                .get(rootUrl + '/financialTracker')
                .end(function(err, res) {
                    done();
                });
        });
    });
});
