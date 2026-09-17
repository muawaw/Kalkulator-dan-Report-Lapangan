// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./components/home";
import Config from "./components/config";
import Calculator from "./components/calculator";
import Dashboard from "./components/dashboard";
import Extend from "./components/extend";
import SplashScreen from "./components/aesthetics/splash_screen";
import { apiRequest } from "./services/api";

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Connecting to...");

  useEffect(() => {
    async function initializeApp() {
      try {
        setLoadingStatus("Loading and checking connection to the server...");

        // Real API calls to wait for backend response
        await Promise.all([
          apiRequest("/config/lapangan"),
          apiRequest("/config/reclub"),
        ]);

        setLoadingStatus("Ready!");

        await new Promise((resolve) => setTimeout(resolve, 2200));
      } catch (error) {
        console.error("Failed to connect:", error);
        setLoadingStatus(
          "Connection error occurred... Please contact system administrator",
        );
      } finally {
        // Hide splash screen only AFTER backend returns
        setIsAppLoading(false);
      }
    }

    initializeApp();
  }, []);

  return (
    <>
      {isAppLoading && <SplashScreen statusText={loadingStatus} />}

      {/* Main Router / App Content */}
      <main className={isAppLoading ? "hidden" : "block"}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/config" element={<Config />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/extend" element={<Extend />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
