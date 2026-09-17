// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./components/home";
import Config from "./components/config";
import Calculator from "./components/calculator";
import Dashboard from "./components/dashboard";
import Extend from "./components/extend";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/config" element={<Config />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/extend" element={<Extend />} />
      </Routes>
    </div>
  );
}

export default App;
