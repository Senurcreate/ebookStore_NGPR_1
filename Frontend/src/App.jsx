import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { fetchPurchasedBooks, clearPurchases } from "./redux/features/purchases/purchaseSlice";

// --- LAZY LOADED IMPORTS (Optimization) ---
// User Pages
const Home = lazy(() => import("./pages/Home/Home"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignUpPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const BookDetails = lazy(() => import("./pages/BookDetails/BookDetails"));
const Preview = lazy(() => import("./pages/BookDetails/Preview"));
const Profile = lazy(() => import("./pages/UserProfilePage"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const History = lazy(() => import("./pages/DownloadHistory")); // Download History
const Checkout = lazy(() => import("./pages/Payments/Checkout"));
const CardDetails = lazy(() => import("./pages/Payments/CardDetailsPage"));
const PaymentMethod = lazy(() => import("./pages/Payments/PaymentMethodPage"));
const ReviewOrder = lazy(() => import("./pages/Payments/ReviewOrderPage"));
const Help = lazy(() => import("./pages/SupportCenter"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const BookPage = lazy(() => import("./pages/BookPage/BookPage")); // E-Books Listing
const AudiobookPage = lazy(() => import("./pages/BookPage/AudiobookPage"));
const PaymentSuccess = lazy(() => import("./pages/Payments/PaymentSuccessPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminRoute = lazy(() => import("./routes/AdminRoute"));
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Books = lazy(() => import("./admin/pages/Books"));
const Purchases = lazy(() => import("./admin/pages/Purchases"));
const Analytics = lazy(() => import("./admin/pages/Analytics"));
const Users = lazy(() => import("./admin/pages/Users"));
const Reviews = lazy(() => import("./admin/pages/Reviews"));

// --- LOADING SPINNER COMPONENT ---
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div className="text-center">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted fw-medium">Loading content...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  // --- REDUX PURCHASE SYNC ---
  useEffect(() => {
    if (currentUser) {
      // User is logged in: Get their books ONE time
      dispatch(fetchPurchasedBooks());
    } else {
      // User logged out: Clear the sensitive data
      dispatch(clearPurchases());
    }
  }, [currentUser, dispatch]);

  // Hide navbar/footer on specific pages
  const hideNavbarPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder", "/forgot-password"];
  const hideFooterPaths = ["/login", "/signup", "/cardDetails", "/paymentMethod", "/reviewOrder", "/forgot-password"];

  const isPreviewPage = location.pathname.startsWith("/preview/");

  const showNavbar = !hideNavbarPaths.includes(location.pathname) && !isAdminPath && !isPreviewPage;
  const showFooter = !hideFooterPaths.includes(location.pathname) && !isAdminPath && !isPreviewPage;

  return (
    <div className="App">
      <ScrollToTop />
      
      {showNavbar && <Navbar />}
      
      <main className={!isAdminPath && !isPreviewPage && !hideNavbarPaths.includes(location.pathname) ? "py-4" : ""}>
        
        {/* SUSPENSE WRAPPER FOR LAZY LOADING */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public/User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/bookDetails" element={<BookDetails />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/preview/:id" element={<Preview />} />
            
            <Route path="/e-books" element={<BookPage />} />
            <Route path="/audiobooks" element={<AudiobookPage />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/downloads" element={<History />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/help" element={<Help />} />

            {/* Payment Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cardDetails" element={<CardDetails />} />
            <Route path="/paymentMethod" element={<PaymentMethod />} />
            <Route path="/reviewOrder" element={<ReviewOrder />} />
            <Route path="/paymentSuccess" element={<PaymentSuccess />} />

            {/* ADMIN ROUTES */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/*" element={
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="books" element={<Books />} />
                    <Route path="purchases" element={<Purchases />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="users" element={<Users />} />
                  </Routes>
                </AdminLayout>
              } />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default App;