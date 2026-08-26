import "./App.css";

import Header from "./components/Header";
import Banner from "./components/Banner";
import HomePage from "./components/HomePage";

function App() {
  return (
    <div className="h-1000000">
      <header>
        <Header />
      </header>
      <Banner />
      <HomePage />
    </div>
  );
}

export default App;
