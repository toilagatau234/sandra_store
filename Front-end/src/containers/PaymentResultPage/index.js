import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import orderApi from 'apis/orderApi';
import { useDispatch } from 'react-redux';
import cartReducers from 'reducers/carts';

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [msg, setMsg] = useState('Đang xử lý kết quả thanh toán...');
  const dispatch = useDispatch();
  
  // useRef để chắn việc gọi API 2 lần trong React StrictMode
  const isProcessed = useRef(false);

  useEffect(() => {
    const processPayment = async () => {
      // Nếu đã xử lý rồi thì dừng lại ngay
      if (isProcessed.current) return;
      isProcessed.current = true;

      // 1. Lấy mã phản hồi từ URL
      const responseCode = searchParams.get('vnp_ResponseCode');

      // 2. Kiểm tra kết quả
      if (responseCode === '00') {
        // --- THANH TOÁN THÀNH CÔNG ---
        try {
          const pendingOrderStr = localStorage.getItem('PENDING_ORDER');
          
          if (pendingOrderStr) {
            const orderData = JSON.parse(pendingOrderStr);
            
            // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG TRƯỚC KHI LƯU
            // Ví dụ: orderStatus = 2 (Đã thanh toán / Chờ xử lý)
            // paymentStatus = 1 (Paid) - Tùy thuộc vào Model của bạn
            const finalOrderData = {
                ...orderData,
                orderStatus: 1, // Cập nhật trạng thái sang "Đã xác nhận/Thanh toán"
                // Nếu backend có trường isPaid, hãy thêm vào đây
                // isPaid: true 
            };

            // Gọi API tạo đơn hàng
            const res = await orderApi.postCreateOrder2(finalOrderData);

            if (res && (res.status === 200 || res.status === 201)) {
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
            // Trường hợp user refresh lại trang (localStorage đã bị xóa từ lần trước)
            setStatus('success');
            setMsg('Giao dịch đã được ghi nhận trước đó.');
          }
        } catch (error) {
          console.error("Lỗi lưu đơn hàng:", error);
          setStatus('error');
          setMsg('Lỗi hệ thống khi lưu đơn hàng.');
        }
      } else {
        // --- THANH TOÁN THẤT BẠI ---
        setStatus('error');
        // Mã 24 là Khách hủy giao dịch
        setMsg(responseCode === '24' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch thất bại.');
        // Không xóa PENDING_ORDER để user có thể quay lại thanh toán tiếp nếu muốn
        // Hoặc xóa đi bắt user đặt lại từ đầu tùy logic của bạn
        localStorage.removeItem('PENDING_ORDER'); 
      }
    };

    processPayment();
  }, [searchParams, dispatch]);

  return (
    <div className="container m-tb-32" style={{ minHeight: '60vh', padding: '50px 0' }}>
      {status === 'processing' && (
        <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <p className="m-t-16">{msg}</p>
        </div>
      )}

      {status === 'success' && (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={msg}
          extra={[
            <Button type="primary" key="home">
              <Link to="/">Về trang chủ</Link>
            </Button>,
            <Button key="order">
               <Link to="/account/orders">Xem đơn hàng</Link>
            </Button>,
          ]}
        />
      )}

      {status === 'error' && (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={msg}
          extra={[
            <Button type="primary" key="home">
              <Link to="/">Về trang chủ</Link>
            </Button>,
            <Button key="cart">
                <Link to="/cart">Về giỏ hàng</Link>
            </Button>
          ]}
        />
      )}
    </div>
  );
}

export default PaymentResult;