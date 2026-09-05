import App from "../App";
import DetailProduct from "../pages/DetailProduct";
import ForgotPassword from "../pages/ForgotPassword";
import LoginUser from "../pages/LoginUser";

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
  }
];

export default routes;
