import constants from 'constants/index.js';
// 1. Import trực tiếp AccountPage để tránh lỗi lazy loading với nested route
import AccountPage from 'containers/AccountPage';
import HomePage from 'containers/HomePage';
import ProductDetailPage from 'containers/ProductDetailPage';
import React from 'react';

// lazy loading các component khác
const SignUp = React.lazy(() => import('containers/SignUp'));
const Login = React.lazy(() => import('containers/Login'));
const ForgotPassword = React.lazy(() =>
  import('containers/Login/ForgotPassword'),
);
const NotFound = React.lazy(() => import('components/NotFound'));
const Cart = React.lazy(() => import('components/Cart'));
const AdminPage = React.lazy(() => import('containers/AdminPage'));
const SearchResult = React.lazy(() =>
  import('containers/SearchFilterPage/Search'),
);
const FilterResult = React.lazy(() =>
  import('containers/SearchFilterPage/Filter'),
);
const PaymentPage = React.lazy(() => import('containers/PaymentPage'));

// --- MỚI THÊM: Import trang kết quả thanh toán ---
const PaymentResult = React.lazy(() => import('containers/PaymentResultPage'));

const routes = [
  {
    path: constants.ROUTES.HOME,
    exact: true,
    main: () => <HomePage />,
  },
  {
    path: constants.ROUTES.PRODUCT,
    main: () => <ProductDetailPage />,
  },
  {
    path: constants.ROUTES.SIGNUP,
    exact: true,
    main: () => <SignUp />,
  },
  {
    path: constants.ROUTES.LOGIN,
    exact: true,
    main: () => <Login />,
  },
  {
    path: constants.ROUTES.FORGOT_PASSWORD,
    exact: true,
    main: () => <ForgotPassword />,
  },
  {
    path: constants.ROUTES.ADMIN,
    exact: true,
    main: () => <AdminPage />,
  },
  {
    path: constants.ROUTES.CART,
    exact: false,
    main: () => <Cart list={[]} />,
  },
  {
    path: constants.ROUTES.NOT_FOUND,
    exact: true,
    main: () => <NotFound />,
  },
  {
    path: constants.ROUTES.SEARCH,
    exact: true,
    main: () => <SearchResult />,
  },
  {
    path: constants.ROUTES.FILTER,
    exact: true,
    main: () => <FilterResult />,
  },
  {
    path: constants.ROUTES.ACCOUNT + '/*',
    exact: false,
    main: () => <AccountPage />,
  },
  {
    path: constants.ROUTES.PAYMENT,
    exact: true,
    main: () => <PaymentPage />,
  },
  // --- MỚI THÊM: Route cho trang kết quả thanh toán ---
  {
    path: '/payment-result',
    exact: true,
    main: () => <PaymentResult />,
  },
];

export default {
  routes,
};