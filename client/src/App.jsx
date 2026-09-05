import "./App.css";

import Header from "./components/Header";
import Banner from "./components/Banner";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
// import {requestAuth} from "./config/userRequest";
// import { useEffect } from "react";

function App() {
  // useEffect(() => {
  //   const fetchAuth = async () => {
  //     try {
  //       const res = await requestAuth();
  //       console.log("Authentication successful:", res);
  //     } catch (error) {
  //       console.error("Authentication failed:", error);
  //     }
  //   };
  //   fetchAuth();
  // }, []);

  return (
    <div className="h-1000000">
      <header>
        <Header />
      </header>
      <Banner />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;
