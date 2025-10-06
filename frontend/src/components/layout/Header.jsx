import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';
import { 
  FaBars, 
  FaTimes, 
  FaShoppingCart, 
  FaUser, 
  FaSearch, 
  FaHeart,
  FaPhone,
  FaSignOutAlt
} from 'react-icons/fa';

// Store actions
import { logout } from '../../store/slices/authSlice';
import { 
  toggleMobileMenu, 
  closeMobileMenu, 
  toggleSearchModal,
  closeSearchModal,
  toggleCartModal 
} from '../../store/slices/uiSlice';

// Components
import CartModal from '../modals/CartModal';
import SearchModal from '../modals/SearchModal';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { totalQuantity } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { 
    isMobileMenuOpen, 
    isSearchModalOpen, 
    isCartModalOpen 
  } = useSelector(state => state.ui);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items - BESTEA Structure
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeMobileMenu());
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-bestea-500 to-bestea-600 text-white text-center py-3">
        <div className="w-full px-4">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <FaPhone className="w-3 h-3" />
              <span>Call: 8000587288 / 9500595929</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/30"></div>
            <div className="hidden md:flex items-center space-x-1">
              <span>🚚</span>
              <span>Free Shipping Above ₹499</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white shadow-md'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 lg:h-22">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-3 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>

            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 flex-shrink-0 group"
              onClick={() => dispatch(closeMobileMenu())}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-bestea-500 to-bestea-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-bestea-500/25 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-80"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-serif">
                  BESTEA
                </span>
                <div className="text-xs text-bestea-600 font-medium tracking-wider uppercase">
                  Premium Tea Co.
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 font-medium text-sm tracking-wide uppercase transition-all duration-300 group rounded-xl ${
                      isActive 
                        ? 'text-bestea-600 bg-bestea-50' 
                        : 'text-slate-700 hover:text-bestea-600 hover:bg-bestea-50'
                    }`}
                  >
                    {item.name}
                    <span className={`absolute inset-x-4 -bottom-1 h-0.5 bg-gradient-to-r from-bestea-500 to-bestea-600 transform transition-transform duration-300 rounded-full ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              
              {/* Search */}
              <button
                onClick={() => dispatch(toggleSearchModal())}
                className="p-3 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 group"
                aria-label="Search"
              >
                <FaSearch size={18} className="group-hover:scale-110 transition-transform duration-300" />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="relative p-3 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 group"
                  aria-label="Wishlist"
                >
                  <FaHeart size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-3 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 group"
                aria-label="Shopping cart"
              >
                <FaShoppingCart size={18} className="group-hover:scale-110 transition-transform duration-300" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-bestea-500 to-bestea-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-3 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 group">
                    {user && getAvatarUrl(user) !== '/images/default-avatar.svg' ? (
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name || 'User'}
                        onError={handleAvatarError}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-bestea-100 group-hover:ring-bestea-300 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-bestea-400 to-bestea-500 rounded-full flex items-center justify-center">
                        <FaUser size={14} className="text-white" />
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-semibold">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-bestea-50 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-bestea-50 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-bestea-50 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaHeart className="w-4 h-4" />
                        <span>Wishlist</span>
                      </Link>
                    </div>
                    
                    {/* Admin Panel Links */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="px-2 py-2">
                          <hr className="border-gray-200" />
                          <div className="px-4 py-3">
                            <span className="text-xs font-bold text-bestea-600 uppercase tracking-wider bg-bestea-50 px-2 py-1 rounded-full">
                              Admin Panel
                            </span>
                          </div>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-bestea-600 hover:bg-bestea-100 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                          >
                            <div className="w-4 h-4 bg-bestea-500 rounded-sm"></div>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/products"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-bestea-600 hover:bg-bestea-100 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                          >
                            <div className="w-4 h-4 bg-bestea-500 rounded-sm"></div>
                            <span>Products</span>
                          </Link>
                          <Link
                            to="/admin/orders"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-bestea-600 hover:bg-bestea-100 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                          >
                            <div className="w-4 h-4 bg-bestea-500 rounded-sm"></div>
                            <span>Orders</span>
                          </Link>
                          <Link
                            to="/admin/customers"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-bestea-600 hover:bg-bestea-100 hover:text-bestea-700 rounded-xl transition-all duration-300 font-medium"
                          >
                            <div className="w-4 h-4 bg-bestea-500 rounded-sm"></div>
                            <span>Customers</span>
                          </Link>
                        </div>
                      </>
                    )}
                    
                    <div className="p-2">
                      <hr className="border-gray-200 mb-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaSignOutAlt size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2.5 bg-gradient-to-r from-bestea-500 to-bestea-600 text-white font-semibold rounded-xl hover:from-bestea-600 hover:to-bestea-700 transition-all duration-300 shadow-lg hover:shadow-bestea-500/25 transform hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 bg-gradient-to-b from-white to-gray-50"
            >
              <div className="w-full px-4 py-6">
                <nav className="space-y-2">
                  {navigation.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => dispatch(closeMobileMenu())}
                          className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                            isActive 
                              ? 'text-bestea-600 bg-bestea-100 border-l-4 border-bestea-500' 
                              : 'text-slate-700 hover:text-bestea-600 hover:bg-bestea-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-bestea-600' : 'bg-bestea-400'
                          }`}></div>
                          <span>{item.name}</span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-2 h-2 bg-bestea-600 rounded-full"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  {!isAuthenticated && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="pt-4 border-t border-gray-200 space-y-2"
                    >
                      <Link
                        to="/auth"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-bestea-500 to-bestea-600 text-white rounded-xl font-semibold shadow-lg"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>Login / Register</span>
                      </Link>
                    </motion.div>
                  )}
                  
                  {isAuthenticated && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="pt-4 border-t border-gray-200 space-y-2"
                    >
                      <Link
                        to="/profile"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center space-x-3 py-3 px-4 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center space-x-3 py-3 px-4 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        <span>My Cart {totalQuantity > 0 && `(${totalQuantity})`}</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => dispatch(closeMobileMenu())}
                        className="flex items-center space-x-3 py-3 px-4 text-slate-700 hover:text-bestea-600 hover:bg-bestea-50 rounded-xl transition-all duration-300 font-medium"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <SearchModal />
      <CartModal />
    </>
  );
};

export default Header;
