import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPassword";
import BookDetails from "./pages/BookDetails/BookDetails";
import Preview from "./pages/BookDetails/Preview";
import Profile from "./pages/UserProfilePage";
import OrderHistory from './pages/OrderHistory';
import History from "./pages/DownloadHistory";
import Checkout from "./pages/Payments/Checkout";
import CardDetails from "./pages/Payments/CardDetailsPage";
import PaymentMethod from "./pages/Payments/PaymentMethodPage";
import ReviewOrder from "./pages/Payments/ReviewOrderPage";
import Help from "./pages/SupportCenter";
import WishlistPage from "./pages/WishlistPage";
import BookPage from "./pages/BookPage/BookPage";
import AudiobookPage from "./pages/BookPage/AudiobookPage";
import PaymentSuccess from "./pages/Payments/PaymentSuccessPage";


import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Books from "./admin/pages/Books";
import Purchases from "./admin/pages/Purchases";
import Analytics from "./admin/pages/Analytics";
import Users from "./admin/pages/Users";
import Reviews from "./admin/pages/Reviews";




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
  const hideNavbarPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder", "/forgot-password" ];
  const hideFooterPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder", "/forgot-password"];

 const isPreviewPage = location.pathname.startsWith("/preview/");


  const showNavbar = !hideNavbarPaths.includes(location.pathname) && !isAdminPath && !isPreviewPage;
  const showFooter = !hideFooterPaths.includes(location.pathname) && !isAdminPath && !isPreviewPage;
 
  


  return (
    <div className="App">
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <main className={!isAdminPath && !isPreviewPage && !hideNavbarPaths.includes(location.pathname) ? "py-4" : ""}> {/*  Added padding */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/bookDetails" element={<BookDetails />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/downloads" element={<History />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cardDetails" element={<CardDetails />} />
        <Route path="/paymentMethod" element={<PaymentMethod />} />
        <Route path="/reviewOrder" element={<ReviewOrder />} />
        <Route path="/help" element={<Help />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/e-books" element={<BookPage />} />
        <Route path="/audiobooks" element={<AudiobookPage />} />
        <Route path="/paymentSuccess" element={<PaymentSuccess/>} />
        


        {/* ADMIN ROUTES */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="books" element={<Books />} />
                <Route path="Purchases" element={<Purchases />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="users" element={<Users />} />
              </Routes>
            </AdminLayout>
          } />
          </Route>

      </Routes>
      </main>
      {showFooter && <Footer />}
    </div>

  );
}

export default App;
