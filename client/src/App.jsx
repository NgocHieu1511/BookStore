import "./App.css";

import Header from "./components/Header";
import Banner from "./components/Banner";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";

function App() {
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
