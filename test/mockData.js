const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var users = [
    {
        _id: ObjectId('591ef60f4dc01a565e091ac3'),
        planId: '58f4edeb2fbe2a27060c8d9d',
        buildId: '58f4ee162fbe2a27060c8d9e',
        name: 'Test',
        lastName: 'Test',
        businessName: 'Develop',
        email: 'admin@admin.loc',
        phone: 23423423423.0,
        password: 'rU6CqnHsVx25db2a466960fb272f4e245515eeaf94',
        billingAddress: '12365',
        finishedSteps: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54;
        ],
        couponId: null,
        build_date: '2017-05-19T13:37:14.759Z',
        plan_date: '2017-05-19T13:37:14.759Z',
        admin: 1,
        __v: 0,
        stripeId: 'cus_AgYRQHAeYHTGvP',
        stripeSource: 'card_1ALBKEIpmN0dayvfuxRhfDwh'
    },

    {
        _id: ObjectId('591ef8ac4dc01a565e091ac5'),
        planId: '58f4ed972fbe2a27060c8d9a',
        buildId: '58f4ee162fbe2a27060c8d9e',
        name: 'Vsevolod',
        lastName: 'Yakunin',
        businessName: 'My soft comp',
        email: 'vsevolod@silverlininglimited.com',
        phone: 634607079,
        password: 'g3a6bQClmb5aba997cada3eb78265bfb890fe838bc',
        billingAddress: 'anything',
        finishedSteps: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54
        ],
        couponId: null,
        build_date: '2017-05-19T13:49:30.776Z',
        plan_date: '2017-05-19T13:49:30.776Z',
        admin: 1,
        __v: 0,
        stripeId: 'cus_AgYcoUGLobsttJ',
        stripeSource: 'card_1ALBV1IpmN0dayvfbeKpXfaE'
    },

    {
        _id: ObjectId('5922fcef267c4975b425fb71'),
        planId: '58f4edd32fbe2a27060c8d9c',
        buildId: '58f4ee162fbe2a27060c8d9e',
        name: 'Adi',
        lastName: 'Daslir',
        businessName: 'Adidas',
        email: 'pedchenko07@gmail.com',
        billingAddress: '12365',
        phone: 123456,
        password: 'gRS0Mglp7L437dc4314522d13379aa44bd8b1aca44',
        finishedSteps: [],
        couponId: null,
        build_date: '2017-05-22T14:57:07.459Z',
        plan_date: '2017-05-22T14:57:07.459Z',
        admin: 1,
        __v: 0,
        stripeId: 'cus_AhhNFT3Y0z6bgI',
        stripeSource: 'card_1AMHyfIpmN0dayvfAdZXsc4a'
    },

    {
        _id: ObjectId('59250b23267c4975b425fb75'),
        planId: '58f4ed792fbe2a27060c8d99',
        buildId: '58f4ee162fbe2a27060c8d9e',
        password: 'CZAGggf7E1abdb94c4ade34417d5400f6c3e6e5840',
        email: 'mparas@gmail.com',
        name: 'michael',
        lastName: 'paraskakis',
        phone: 9173197345.0,
        businessName: 'mike',
        billingAddress: '39 Moron Street',
        finishedSteps: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54
        ],
        couponId: null,
        build_date: '2017-05-24T04:21:32.646Z',
        plan_date: '2017-05-24T04:21:32.646Z',
        admin: 1,
        __v: 0,
        stripeId: 'cus_AiHaiqINCWUXnM',
        stripeSource: 'card_1AMr1KIpmN0dayvfPMS0YykJ'
    }
];

var products = [
    {
        _id: ObjectId('58f4ed602fbe2a27060c8d98'),
        billingFrequency: 12,
        typeProduct: 1,
        buildType: 1,
        status: 1,
        productName: 'selfSLAP',
        productDescription: 'self slap description',
        costProduct: 200,
        amountFirstPayment: 0,
        expertHours: null,
        __v: 0
    },

    {
        _id: ObjectId('58f4ed792fbe2a27060c8d99'),
        billingFrequency: 12,
        typeProduct: 1,
        buildType: 1,
        status: 1,
        productName: 'groupSLAP',
        productDescription: 'group SLAP description',
        costProduct: 250,
        amountFirstPayment: 0,
        expertHours: 20,
        __v: 0
    },

    {
        _id: ObjectId('58f4ed972fbe2a27060c8d9a'),
        billingFrequency: 12,
        typeProduct: 1,
        buildType: 1,
        status: 1,
        productName: 'monthlySLAP',
        productDescription: 'monthly SLAP description',
        costProduct: 300,
        amountFirstPayment: 0,
        expertHours: 50,
        __v: 0
    }
];

var coupons = [
    {
        _id: ObjectId('58f4ed972fbe3a26060c8d9a'),
        name: 'Awsome coupon',
        code: 'xhg4k4ku54',
        amount: 20000,
        plan: 'Awesome plan',
        redemption: 3
    },
    {
        _id: ObjectId('58f5ed972fbe2a28880c8d9a'),
        name: 'Golden coupon',
        code: 'xhf6k6kp54',
        amount: 20000,
        plan: 'Golden plan',
        redemption: 10
    },

    {
        _id: ObjectId('58f4ed972fbe3a28080c8d9a'),
        name: 'Golden coupon',
        code: 'xhf6k6kp54',
        amount: 20000,
        plan: 'Silver plan',
        redemption: 8
    }
];

module.exports = {
    users: users,
    products: products,
    coupons: coupons
};
