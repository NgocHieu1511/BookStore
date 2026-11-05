import App from "../App";
import DetailProduct from "../pages/DetailProduct/DetailProduct";
import ForgotPassword from "../pages/ForgotPassword";
import LoginUser from "../pages/LoginUser";
import CartUser from "../pages/CartUser";
import Checkout from "../pages/CheckOut";
import PaymentSuccess from "../pages/PaymentSuccess";
import OrderManagement from "../pages/admin/Components/Order/OrderManagement";
import OrderDetailAdmin from "../pages/admin/Components/Order/OrderDetailAdmin";
import MyOrders from "../pages/MyOrders";
import OrderDetail from "../pages/OrderDetail";
import Dashboard from "../pages/admin/DashBoard";
import MyAccountLayout from "../pages/MyAccountLayout";
import ProductCategory from "../pages/ProductCategory";
import InfoUser from "../pages/InfoUser/InfoUser";

const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/product/:id",
    element: <DetailProduct />,
  },
  {
    path: "/login",
    element: <LoginUser />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
    {
    path: "/cart",
    element: <CartUser />,
  },
   {
    path: "/checkout",
    element: <Checkout />,
  },
   {  
    path: "/payment-success/:orderId",
    element: <PaymentSuccess />,
  },
  {
  path: "/admin/orders",
  element: <OrderManagement />,
},
{
  path: "/admin/orders/:orderId",
  element: <OrderDetailAdmin />,
},
// {
//   path: "/account/my-orders",
//   element: <MyOrders />,
// },
 // KHÁCH HÀNG: CHI TIẾT ĐƠN HÀNG
  {
    path: "/order/:orderId",
    element: <OrderDetail />,
  },
  {
    path: "/admin",
    element: <Dashboard />,
  },
  {
        path: '/customer',
        element: <InfoUser />,
    },

    {
        path: '/order',
        element: <InfoUser />,
    },

    {
        path: '/review',
        element: <InfoUser />,
    },

    {
        path: '/favorite',
        element: <InfoUser />,
    },

    {
        path: '/address',
        element: <InfoUser />,
    },


{
    path: "/account",
    element: <MyAccountLayout />,
    children: [
        {
            path: "my-orders",
            element: <MyOrders />,
        },
      
    ],
},
{
  path: "/category/:id",
  element: <ProductCategory />,
},
{
  path: "/info-user",
  element: <InfoUser/>,
}


];

export default routes;
