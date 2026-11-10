import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "./routes/index.jsx";
import { Provider } from "./store/Provider.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatWidget from "./components/ChatWidget.jsx";
import AIChatbot from "./components/AIChatbot.jsx";
const renderRoutes = (routeList) =>
  routeList.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));

createRoot(document.getElementById("root")).render(
  <StrictMode>
       <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID_GOOGLE}>
        <Provider>
      <Router>
        <Routes>{renderRoutes(routes)}</Routes>
         <ChatWidget />
          <AIChatbot />
      </Router>
    </Provider>
       </GoogleOAuthProvider>
    
  </StrictMode>,
);
