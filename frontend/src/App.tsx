import React from "react";
import "./App.css";
import Product from "./components/ProductCard";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <div id="detail">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
