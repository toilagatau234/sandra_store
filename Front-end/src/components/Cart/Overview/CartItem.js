import { DeleteOutlined } from '@ant-design/icons';
import { Avatar, InputNumber, Tooltip, Popconfirm } from 'antd'; 
import helpers from 'helpers';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

function CartItem({
  _id = '',
  name = '',
  code = '',
  avt = '',
  stock = 0,
  discount = 0,
  price = 0,
  amount = 1,
  index,
  onDelCartItem,
  onUpdateNumOfProd,
}) {
  
  // SỬA LOGIC: Giá niêm yết = Giá bán + %
  const priceList = price + (price * discount) / 100;

  return (
    <div className="d-flex bg-white p-12 bor-rad-4 justify-content-between">
      <div className="d-flex flex-grow-1">
        <Avatar src={avt} alt="Photo" shape="square" size={80} />
        <div
          className="d-flex flex-direction-column p-lr-8"
          style={{ maxWidth: 400 }}
        >
          <Link to={`/product/${_id}`} className="font-size-16px">
            <Tooltip title={name}>
              {helpers.reduceProductName(name, 20)}
            </Tooltip>
          </Link>
          <span style={{ color: '#aaa' }}>{code}</span>
        </div>
      </div>

      <div className="d-flex align-i-center" style={{ flexBasis: 128 }}>
        <Popconfirm
          title="Bạn có chắc muốn xoá toàn bộ sản phẩm trong giỏ hàng ?"
          placement="bottom"
          okButtonProps={{ type: "primary" }}
          onConfirm={() => onDelCartItem(index)}
          okText="Đồng ý"
          cancelText="Huỷ bỏ"
        >
          <DeleteOutlined className="icon-del-item m-r-16" />
        </Popconfirm>

        <div>
          <InputNumber
            min={1}
            max={stock}
            value={amount}
            onChange={(value) => onUpdateNumOfProd(index, value)}
            size="large"
            style={{ borderColor: '#3555C5' }}
          />
        </div>
      </div>

      {/* GIÁ */}
      <div
        className="d-flex flex-direction-column align-items-end"
        style={{ flexBasis: 180 }}
      >
        {/* Giá bán (Xanh) */}
        <b className="font-size-18px" style={{ color: "#3555C5" }}>
          {helpers.formatProductPrice(price)}
        </b>
        
        {/* Giá gốc (Gạch ngang) - Chỉ hiện nếu có giảm giá */}
        {discount > 0 && (
          <span style={{ textDecoration: "line-through", color: "#aaa" }}>
            {helpers.formatProductPrice(priceList)}
          </span>
        )}
      </div>
    </div>
  );
}

CartItem.propTypes = {
  onDelCartItem: PropTypes.func,
  onUpdateNumOfProd: PropTypes.func,
  index: PropTypes.any,
  _id: PropTypes.string,
  avt: PropTypes.string,
  code: PropTypes.string,
  discount: PropTypes.number,
  amount: PropTypes.number,
  name: PropTypes.string,
  price: PropTypes.number,
  stock: PropTypes.number,
};

export default CartItem;