import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './store';
import LoadingSpinner from './components/common/LoadingSpinner';

// Store actions
import { initializeAuth, getCurrentUser, logout } from './store/slices/authSlice';
import { initializeCart } from './store/slices/cartSlice';
import { initializeWishlist, fetchWishlist, syncWishlistToAPI } from './store/slices/wishlistSlice';
import { setScreenSize } from './store/slices/uiSlice';

// Utils
import { setupAxiosInterceptors, isTokenExpired } from './utils/auth';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import NotificationContainer from './components/common/NotificationContainer';

// Modal Components
import CartModal from './components/modals/CartModal';
import SearchModal from './components/modals/SearchModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import BrewingGuide from './pages/BrewingGuide';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AddEditProduct from './pages/admin/AddEditProduct';
import AdminProductDetail from './pages/admin/AdminProductDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

// App content component that uses hooks
function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, isAuthenticated } = useSelector(state => state.auth);
  const { pageLoading } = useSelector(state => state.ui);

  // Initialize app
  useEffect(() => {
    // Setup axios interceptors for automatic logout on 401 errors
    setupAxiosInterceptors(dispatch, logout);
    
    // Initialize auth from localStorage
    dispatch(initializeAuth());
    
    // Initialize cart and wishlist
    dispatch(initializeCart());
    dispatch(initializeWishlist());
    
    // Set initial screen size
    const updateScreenSize = () => {
      dispatch(setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      }));
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [dispatch]);

  // Get current user if token exists and is valid
  useEffect(() => {
    if (token && !isAuthenticated) {
      // Check if token is expired before making API call
      if (isTokenExpired(token)) {
        dispatch(logout());
      } else {
        dispatch(getCurrentUser());
      }
    }
  }, [dispatch, token, isAuthenticated]);

  // Sync wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      // First, sync localStorage wishlist to backend
      dispatch(syncWishlistToAPI()).then(() => {
        // Then fetch the merged wishlist from backend
        dispatch(fetchWishlist());
      });
    }
  }, [dispatch, isAuthenticated, token]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (pageLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/brewing-guide" element={<BrewingGuide />} />
          
          {/* Protected Customer Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AddEditProduct />} />
            <Route path="products/edit/:id" element={<AddEditProduct />} />
            <Route path="products/:id" element={<AdminProductDetail />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <CartModal />
      <SearchModal />
      
      {/* Notifications */}
      <NotificationContainer />
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 80,
          right: 20,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #86efac',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
            style: {
              background: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #93c5fd',
            },
          },
        }}
      />
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingSpinner />} 
        persistor={persistor}
      >
        <HelmetProvider>
          <Router>
            <AppContent />
          </Router>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
