import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import constants from 'constants/index';
import orderApi from 'apis/orderApi'; // Import API tạo đơn hàng
import { useDispatch } from 'react-redux';
import cartReducers from 'reducers/carts';

function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); 
  const [msg, setMsg] = useState('Đang xử lý kết quả thanh toán...');
  const dispatch = useDispatch();

  useEffect(() => {
    const processPayment = async () => {
      // 1. Lấy mã phản hồi từ URL
      const responseCode = searchParams.get('vnp_ResponseCode');
      
      // 2. Kiểm tra kết quả
      if (responseCode === '00') {
        // THANH TOÁN THÀNH CÔNG
        try {
          // Lấy dữ liệu đơn hàng đã lưu tạm trước đó
          const pendingOrderStr = localStorage.getItem('PENDING_ORDER');
          
          if (pendingOrderStr) {
            const orderData = JSON.parse(pendingOrderStr);
            
            // Gọi API tạo đơn hàng (Lưu vào DB)
            const res = await orderApi.postCreateOrder2(orderData);
            
            if (res && res.status === 200) {
              setStatus('success');
              setMsg('Giao dịch thành công! Đơn hàng đã được ghi nhận.');
              // Xóa giỏ hàng và dữ liệu tạm
              dispatch(cartReducers.resetCart());
              localStorage.removeItem('PENDING_ORDER');
            } else {
              setStatus('error');
              setMsg('Thanh toán thành công nhưng lỗi lưu đơn hàng. Vui lòng liên hệ Admin.');
            }
          } else {
             // Trường hợp refresh lại trang kết quả nhưng đã mất dữ liệu tạm
             setStatus('success'); 
             setMsg('Giao dịch thành công (Dữ liệu đơn hàng đã được xử lý trước đó).');
          }
        } catch (error) {
          setStatus('error');
          setMsg('Lỗi hệ thống khi lưu đơn hàng.');
        }
      } else {
        // THANH TOÁN THẤT BẠI
        setStatus('error');
        setMsg(responseCode === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch thất bại.');
        localStorage.removeItem('PENDING_ORDER'); // Xóa đơn hàng tạm
      }
    };

    processPayment();
  }, []);

  return (
    <div className="container m-tb-32" style={{ minHeight: '60vh' }}>
      {/* ... (Giữ nguyên phần hiển thị Result như code cũ của bạn) ... */}
      {status === 'processing' && <Spin tip={msg} size="large"><div style={{padding: 50}} /></Spin>}
      
      {status === 'success' && (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={msg}
          extra={[
            <Button type="primary" key="home"><Link to="/">Tiếp tục mua sắm</Link></Button>,
            <Button key="history"><Link to="/account/orders">Xem đơn hàng</Link></Button>,
          ]}
        />
      )}

      {status === 'error' && (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={msg}
          extra={[
            <Button type="primary" key="pay"><Link to="/payment">Thử lại</Link></Button>,
            <Button key="home"><Link to="/">Về trang chủ</Link></Button>,
          ]}
        />
      )}
    </div>
  );
}

export default PaymentResultPage;