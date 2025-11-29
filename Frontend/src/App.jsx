import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return <MainLayout />;
}

// useLocation only works inside a Router (we put BrowserRouter in main.jsx)
function MainLayout() {
  const location = useLocation();
  const showNavbar = location.pathname === "/";

  return (
    <AuthProvider>
    <div className="App">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
    </AuthProvider>
  );
}

export default App;
