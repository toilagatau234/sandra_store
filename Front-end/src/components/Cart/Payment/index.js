import { Button } from 'antd';
import constants from 'constants/index';
import helpers from 'helpers';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

function CartPayment(props) {
  // SỬA: Thêm prop discountAmount (mặc định là 0 nếu không có)
  const { carts, isCheckout, transportFee, onCheckout, isLoading, discountAmount = 0 } = props;

  // Tổng giá trị đơn hàng (Thành tiền các món) = Tổng (Giá bán * số lượng)
  const totalItemPrice = carts.reduce(
    (a, b) => a + b.price * b.amount,
    0,
  );

  // Tổng giá gốc (Tạm tính hiển thị) = Tổng ((Giá bán + Giá bán*%KM) * số lượng)
  const tempPrice = carts.reduce(
    (a, b) => a + (b.price + (b.price * b.discount) / 100) * b.amount,
    0,
  );

  // Tổng tiết kiệm từ sản phẩm
  const totalProductDiscount = tempPrice - totalItemPrice;

  // Tổng thanh toán cuối cùng
  const totalPayment = totalItemPrice + transportFee - discountAmount;


  return (
    <div className="Payment bg-white p-16">
      <h2 className="m-b-8">Tiến hành thanh toán</h2>

      {/* Giá tạm tính (Giá gốc) */}
      <div className="d-flex justify-content-between m-b-6">
        <span className="font-size-16px" style={{ color: '#aaa' }}>
          Tạm tính
        </span>
        <b>{helpers.formatProductPrice(tempPrice)}</b>
      </div>

      {/* Phí vận chuyển */}
      <div className="d-flex justify-content-between m-b-6">
        <span className="font-size-16px" style={{ color: '#aaa' }}>
          Phí vận chuyển
        </span>
        <b>{helpers.formatProductPrice(transportFee)}</b>
      </div>

      {/* Giảm giá trực tiếp trên sản phẩm */}
      <div className="d-flex justify-content-between m-b-6">
        <span className="font-size-16px" style={{ color: '#aaa' }}>
          Giảm giá sản phẩm
        </span>
        <b>-{helpers.formatProductPrice(totalProductDiscount)}</b>
      </div>

      {/* SỬA: Hiển thị Voucher giảm giá (Nếu có) */}
      {discountAmount > 0 && (
        <div className="d-flex justify-content-between m-b-6">
          <span className="font-size-16px" style={{ color: '#aaa' }}>
            Voucher giảm giá
          </span>
          <b style={{ color: 'green' }}>-{helpers.formatProductPrice(discountAmount)}</b>
        </div>
      )}

      {/* Thành tiền cuối cùng */}
      <div className="d-flex justify-content-between">
        <span className="font-size-16px" style={{ color: '#aaa' }}>
          Thành tiền
        </span>
        <b style={{ color: 'red', fontSize: 20 }}>
          {helpers.formatProductPrice(totalPayment > 0 ? totalPayment : 0)}
        </b>
      </div>

      <div className="t-end">
        <span
          style={{ color: '#aaa', fontSize: 16 }}>{`(Đã bao gồm VAT)`}</span>
      </div>

      {isCheckout ? (
        <Button
          onClick={onCheckout}
          className="m-t-16 d-block m-lr-auto w-100"
          type="primary"
          size="large"
          loading={isLoading}
          style={{ backgroundColor: '#3555c5', color: '#fff' }}>
          ĐẶT HÀNG NGAY
        </Button>
      ) : (
        <Link to={constants.ROUTES.PAYMENT}>
          <Button
            className="m-t-16 d-block m-lr-auto w-100"
            type="primary"
            size="large"
            style={{ backgroundColor: '#3555c5', color: '#fff' }}>
            THANH TOÁN
          </Button>
        </Link>
      )}
    </div>
  );
}

CartPayment.defaultProps = {
  carts: [],
  isCheckout: false,
  transportFee: 0,
  isLoading: false,
  discountAmount: 0, // Giá trị mặc định
};

CartPayment.propTypes = {
  carts: PropTypes.array,
  isCheckout: PropTypes.bool,
  transportFee: PropTypes.number,
  onCheckout: PropTypes.func,
  isLoading: PropTypes.bool,
  discountAmount: PropTypes.number, // Định nghĩa kiểu dữ liệu
};

export default CartPayment;