import axiosClient from './axiosClient';

const VNPAY_API_ENDPOINT = '/vnpay';

const vnpayApi = {
  createPaymentUrl: (data) => {
    const url = VNPAY_API_ENDPOINT + '/create_payment_url';
    return axiosClient.post(url, data);
  },
};

export default vnpayApi;