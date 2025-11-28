const querystring = require('qs');
const crypto = require('crypto');
const dateFormat = require('dateformat');
// const OrderModel = require('../models/order.model'); // Tạm thời comment nếu chưa dùng để tránh lỗi đường dẫn

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = dateFormat(date, 'yyyymmddHHmmss');
    let ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURNURL;

    let orderId = req.body.orderId;
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    let locale = req.body.language;
    if (locale === null || locale === '') {
      locale = 'vn';
    }
    let currCode = 'VND';
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return res.status(200).json({ code: '00', data: vnpUrl });
  } catch (err) {
    console.error("Lỗi createPaymentUrl:", err);
    return res.status(500).json({ message: 'Error generating URL' });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNP_HASHSECRET;
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      // Redirect về Frontend
      const returnQuery = querystring.stringify(req.query, { encode: false });
      res.redirect(`http://localhost:3000/payment-result?${returnQuery}`);
    } else {
      res.redirect(`http://localhost:3000/payment-result?vnp_ResponseCode=97`);
    }
  } catch (error) {
    console.error("Lỗi vnpayReturn:", error);
    res.redirect(`http://localhost:3000/payment-result?vnp_ResponseCode=99`);
  }
};

const vnpayIpn = async (req, res) => {
  res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
};

// --- QUAN TRỌNG: Đảm bảo phần export này chính xác ---
module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn
};