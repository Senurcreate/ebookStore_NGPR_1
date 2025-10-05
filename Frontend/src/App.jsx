import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

// Separate component so we can use useLocation()
function MainLayout() {
  const location = useLocation();

  // Show Navbar only on home page
  const showNavbar = location.pathname === "/";

  return (
    <div className="App">
      {showNavbar && <Navbar />}  {/* only show Navbar on '/' */}
      
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
