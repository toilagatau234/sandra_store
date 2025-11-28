const express = require('express');
const vnpayApi = express.Router();
const vnpayController = require('../controllers/vnpay.controller');

vnpayApi.post('/create_payment_url', vnpayController.createPaymentUrl);
vnpayApi.get('/vnpay_return', vnpayController.vnpayReturn);
vnpayApi.get('/vnpay_ipn', vnpayController.vnpayIpn);

module.exports = vnpayApi;