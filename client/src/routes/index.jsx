import App from "../App";
import DetailProduct from "../pages/DetailProduct";
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
];

export default routes;
