import App from "../App";
import DetailProduct from "../pages/DetailProduct";
import ForgotPassword from "../pages/ForgotPassword";
import LoginUser from "../pages/LoginUser";
import CartUser from "../pages/CartUser";

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
  }

];

export default routes;
