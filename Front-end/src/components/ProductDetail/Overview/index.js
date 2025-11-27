import { CheckOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Col, Image, InputNumber, message, Rate, Row } from 'antd';
import ImgLoadFailed from 'assets/imgs/loading-img-failed.png';
import constants from 'constants/index';
import helpers from 'helpers';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import cartActions from 'reducers/carts';
import './index.scss';

function countItemInCart(productCode, carts) {
  let count = 0;
  if (carts) {
    carts.forEach((item) => {
      if (item.code === productCode) count += item.amount;
    });
  }
  return count;
}

function ProductOverview(props) {
  const { products } = props;
  // Thêm || {} để tránh crash
  const {
    _id,
    avt,
    name,
    brand,
    code,
    price = 0,
    rate = [],
    discount = 0,
    stock = 0,
    otherInfo,
  } = products.product || {};

  const { catalogs = [], ...productRest } = products.productDetail || {};
  const imgList = [avt, ...catalogs].filter((item) => item);
  const rateTotal = Array.isArray(rate) ? rate.reduce((a, b) => a + b, 0) : 0;
  const rateAvg = helpers.calStar(rate);

  // === SỬA LOGIC GIÁ ===
  // price: Giá lấy từ DB -> Là GIÁ BÁN (17.290.000)
  // priceList: Giá niêm yết (Giá ảo để gạch ngang) = Giá bán + (Giá bán * % / 100)
  const priceList = price + (price * discount) / 100; 

  const [numOfProduct, setNumberOfProduct] = useState(1);
  const [avtIndex, setAvtIndex] = useState(0);
  const carts = useSelector((state) => state.carts);
  const currentStock = stock - countItemInCart(code, carts);

  const dispatch = useDispatch();

  const showCatalogs = (catalog) => {
    return catalog.map((item, index) => (
      <Image.PreviewGroup key={index}>
        <Image
          src={item}
          width={48}
          className={`catalog-item p-8 ${index === avtIndex ? "active" : ""}`}
          onMouseEnter={() => setAvtIndex(index)}
        />
      </Image.PreviewGroup>
    ));
  };

  const showOverviewInfo = (product) => {
    let result = [];
    let i = 0;
    for (let key in product) {
      if (i >= 5) break;
      if (typeof product[key] === 'string') {
        result.push(
          <p key={i++} className="m-b-8">
            {`- ${helpers.convertProductKey(key)}: ${product[key]}`}
          </p>,
        );
      }
    }
    return result;
  };

  const addCart = () => {
    let product = {
      code,
      name,
      price, // Gửi đúng Giá Bán vào giỏ hàng
      amount: numOfProduct,
      avt,
      discount,
      stock,
      _id,
    };
    setNumberOfProduct(1);
    dispatch(cartActions.addToCart(product));
    message.success('Thêm vào giỏ hàng thành công');
  };

  return (
    <Row className="Product-Overview bg-white p-16">
      <Col span={24} md={8}>
        <div
          style={{ height: 450 }}
          className="d-flex align-i-center justify-content-center ">
          <Image
            style={{ maxHeight: "100%" }}
            fallback={ImgLoadFailed}
            src={imgList[avtIndex]}
          />
        </div>
        <div className="d-flex w-100 bg-white p-b-16 p-t-8">
          {showCatalogs(imgList)}
        </div>
        <div className="p-l-16 p-t-16 product-info">
          {showOverviewInfo(productRest)}
        </div>
      </Col>

      <Col span={24} md={16} className="p-l-16">
        <h2 className="font-size-24px ">
          {helpers.reduceProductName(name, 140)}
        </h2>

        <div className="p-tb-8">
          <Rate disabled defaultValue={rateAvg} allowHalf />
          <a href="#evaluation" className="m-l-8">
            (Có {rateTotal} đánh giá)
          </a>
        </div>

        <div
          className="font-size-16px font-weight-400"
          style={{ color: '#aaa' }}>
          Thương hiệu:
          <span className="product-brand font-weight-500">&nbsp;{brand}</span>
          &nbsp; | &nbsp;<span>{code}</span>
        </div>

        {/* HIỂN THỊ GIÁ BÁN LÀ GIÁ CHÍNH */}
        <h1 className="product-price font-weight-700 p-tb-8">
          {price === 0 ? 'Liên hệ' : helpers.formatProductPrice(price)}
        </h1>

        {discount > 0 && price > 0 && (
          <>
            <h3 className="font-weight-700" style={{ color: '#333' }}>
              Bạn có 1 mã giảm giá {discount}% cho sản phẩm này
            </h3>
            <div className="d-flex flex-direction-column m-t-8 m-b-16 p-tb-8 p-lr-16 discount">
              {/* GIÁ NIÊM YẾT (TÍNH TĂNG LÊN) GẠCH NGANG */}
              <span className="discount-price font-size-16px font-weight-700" style={{textDecoration: 'line-through', color: '#aaa'}}>
                Giá niêm yết: {helpers.formatProductPrice(priceList)}
              </span>
              <span className="font-weight-500" style={{color: '#333'}}>
                Tiết kiệm: {helpers.formatProductPrice(priceList - price)}
              </span>
              <div className="discount-mark"></div>
              <CheckOutlined className="discount-mark-icon" />
            </div>
          </>
        )}

        <div className="p-t-12 option">
          {currentStock === 0 ? (
            <h3 className="m-r-8 m-t-8 font-size-18px" style={{ color: 'red' }}>
              <i>Sản phẩm hiện đang hết hàng !</i>
            </h3>
          ) : (
            <>
              <h3 className="m-r-8 m-t-8 font-size-16px">Chọn số lượng: </h3>
              <InputNumber
                name="numOfProduct"
                size="middle"
                value={numOfProduct || 1}
                min={1}
                max={currentStock}
                onChange={(value) => setNumberOfProduct(value)}
              />
            </>
          )}
        </div>

        {price > 0 && currentStock > 0 ? (
          <div className="btn-group p-tb-16 d-flex justify-content-around">
            <Button
              onClick={addCart}
              disabled={stock ? false : true}
              size="large"
              className="m-r-16 w-100 btn-group-item"
              style={{ backgroundColor: '#3555c5' }}>
              THÊM GIỎ HÀNG
            </Button>

            <Button
              onClick={addCart}
              disabled={stock ? false : true}
              size="large"
              className="w-100 btn-group-item"
              style={{ backgroundColor: '#39B3D7' }}>
              <Link to={constants.ROUTES.PAYMENT}> MUA NGAY LUÔN</Link>
            </Button>
          </div>
        ) : (
          <Button
            size="large"
            className="m-tb-16 w-100 btn-group-item"
            style={{ backgroundColor: '#3555c5' }}>
            <a href="#" target="blank">
              <PhoneOutlined style={{ fontSize: 18 }} className="m-r-8" /> LIÊN
              HỆ
            </a>
          </Button>
        )}
        
        {otherInfo &&
          otherInfo.map((item, index) => (
            <ul
              key={index}
              className="otherInfo-listfont-size-14px font-weight-700"
            >
              {item.key}
              <li className="otherInfo-item font-weight-400">{item.value}</li>
            </ul>
          ))}
      </Col>
    </Row>
  );
}

ProductOverview.propTypes = {
  products: PropTypes.object,
};

export default ProductOverview;