import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import BookDetails from "./pages/BookDetails/BookDetails";
import Profile from "./pages/ProfilePage";


import { AuthProvider } from "./context/AuthContext";

function App() {
  return <MainLayout />;
}

// useLocation only works inside a Router (we put BrowserRouter in main.jsx)
function MainLayout() {
  const location = useLocation();
  

  // Hide navbar on login and signup pages
  const hideNavbarPaths = ["/login", "/signup"];
  const hideFooterPaths = ["/login", "/signup"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const showFooter = !hideFooterPaths.includes(location.pathname);


  return (
    <AuthProvider>
    <div className="App">
      {showNavbar && <Navbar />}
      <main className="py-4"> {/*  Added padding */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/bookDetails" element={<BookDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/footer" element={<Footer />} />
      </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
    </AuthProvider>
  );
}

export default App;
