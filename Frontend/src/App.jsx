import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import BookDetails from "./pages/BookDetails/BookDetails";
import Profile from "./pages/UserProfilePage";
import History from "./pages/DownloadHistory";
import Checkout from "./pages/Payments/Checkout";
import CardDetails from "./pages/Payments/CardDetailsPage";
import PaymentMethod from "./pages/Payments/PaymentMethodPage";
import ReviewOrder from "./pages/Payments/ReviewOrderPage";
import Help from "./pages/SupportCenter";
import WishlistPage from "./pages/WishlistPage";
import BookPage from "./pages/BookPage/BookPage";
import AudiobookPage from "./pages/BookPage/AudiobookPage";


import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dasboard";



import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
);
}

// useLocation only works inside a Router (we put BrowserRouter in main.jsx)
function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  // Hide navbar on login and signup pages
  const hideNavbarPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder" ];
  const hideFooterPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder"];


  const showNavbar = !hideNavbarPaths.includes(location.pathname) && !isAdminPath;
  const showFooter = !hideFooterPaths.includes(location.pathname) && !isAdminPath;
 
  


  return (
    <div className="App">
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <main className={!isAdminPath && !hideNavbarPaths.includes(location.pathname) ? "py-4" : ""}> {/*  Added padding */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/bookDetails" element={<BookDetails />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cardDetails" element={<CardDetails />} />
        <Route path="/paymentMethod" element={<PaymentMethod />} />
        <Route path="/reviewOrder" element={<ReviewOrder />} />
        <Route path="/help" element={<Help />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/bookpage" element={<BookPage />} />
        <Route path="/audiopage" element={<AudiobookPage />} />


        {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
              </Routes>
            </AdminLayout>
          } />

      </Routes>
      </main>
      {showFooter && <Footer />}
    </div>

  );
}

export default App;
