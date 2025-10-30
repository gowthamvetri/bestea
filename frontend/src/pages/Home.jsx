import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaStar, 
  FaShoppingCart, 
  FaLeaf, 
  FaTruck, 
  FaAward, 
  FaArrowRight, 
  FaShieldAlt,
  FaCertificate,
  FaHeart,
  FaGift,
  FaCheckCircle
} from 'react-icons/fa';

// Store actions
import { fetchBestSellers, fetchFeaturedProducts, fetchCategories, fetchProductsByCategory } from '../store/slices/productSlice';
import { fetchFeaturedTestimonials } from '../store/slices/reviewSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addToWishlistAPI, removeFromWishlistAPI } from '../store/slices/wishlistSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryProductSlider from '../components/home/CategoryProductSlider';
import Card from '../components/common/Card';
import AddToCartButton from '../components/common/AddToCartButton';
import RecentlyViewedProducts from '../components/product/RecentlyViewedProducts';

// Hero Carousel Component - Now uses dynamic data from featured products
const HeroCarousel = ({ featuredProducts = [] }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  // Use featured product images if available, otherwise fallback to static images
  const slides = React.useMemo(() => {
    if (featuredProducts.length > 0) {
      return featuredProducts.slice(0, 4).map((product, index) => ({
        id: product._id || index + 1,
        image: product.mainImage?.url || product.images?.[0]?.url || `https://images.unsplash.com/photo-${1597318181409 + index * 10000}-cf64d0b3471a?w=600&q=80`,
        alt: product.name || `Featured Tea ${index + 1}`,
        productId: product._id,
        productName: product.name,
        productPrice: product.price
      }));
    }
    
    // Fallback static images if no featured products
    return [
      {
        id: 1,
        image: "https://www.foodandwine.com/thmb/6wTm7a0y87X97LK-ZMxe2787kI8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/different-types-of-tea-FT-BLOG0621-7c7fd231e66d4fea8ca9a47cad52ba79.jpg",
        alt: "Premium Black Tea Collection"
      },
      {
        id: 2, 
        image: "https://static.toiimg.com/thumb/imgsize-23456,msid-121996789,width-600,resizemode-4/765u6g.jpg",
        alt: "Green Tea Varieties"
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80", 
        alt: "Herbal Tea Blends"
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
        alt: "Premium Tea Sets"
      }
    ];
  }, [featuredProducts]);

  // Auto-slide effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/5] shadow-2xl">
        <motion.div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 relative group">
              {slide.productId ? (
                <Link to={`/product/${slide.productId}`} className="block w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Product Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-white font-bold text-lg mb-1">{slide.productName}</h3>
                    <p className="text-white/90 text-sm">₹{slide.productPrice}</p>
                  </div>
                </Link>
              ) : (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </motion.div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-green-500 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Optional */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <FaArrowRight className="rotate-180 text-gray-700" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <FaArrowRight className="text-gray-700" />
      </button>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { bestSellers, featuredProducts, categories, categoryProducts, isLoading } = useSelector(state => state.products);
  const { featuredTestimonials, loading: reviewsLoading } = useSelector(state => state.reviews);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  
  // Ensure all arrays are safe to use
  const safebestSellers = Array.isArray(bestSellers) ? bestSellers : [];
  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeFeaturedTestimonials = Array.isArray(featuredTestimonials) ? featuredTestimonials : [];

  // Get products for the selected category
  const getDisplayedProducts = () => {
    if (selectedCategory === 'all') {
      return safebestSellers;
    }
    
    // Get products for the selected category
    const categoryData = categoryProducts[selectedCategory];
    if (categoryData && categoryData.data && Array.isArray(categoryData.data)) {
      return categoryData.data;
    }
    
    return [];
  };

  const displayedProducts = getDisplayedProducts();

  // Debug: Log displayed products
  useEffect(() => {
    if (displayedProducts.length > 0) {
      console.log('Displayed Products:', displayedProducts);
      console.log('First Product:', displayedProducts[0]);
    }
  }, [displayedProducts]);

  // Wishlist helper functions
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product._id)) {
      // Use API if authenticated, otherwise localStorage
      if (isAuthenticated) {
        await dispatch(removeFromWishlistAPI(product._id));
      } else {
        dispatch(removeFromWishlist(product._id));
      }
      toast.success('Removed from wishlist', {
        icon: '💔',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } else {
      // Use API if authenticated, otherwise localStorage
      if (isAuthenticated) {
        await dispatch(addToWishlistAPI(product));
      } else {
        dispatch(addToWishlist(product));
      }
      toast.success('Added to wishlist!', {
        icon: '❤️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const hasFetchedCategories = React.useRef(false);

  useEffect(() => {
    dispatch(fetchBestSellers());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchFeaturedTestimonials());
    
    // Only fetch categories once to prevent duplicate requests
    if (!hasFetchedCategories.current && categories.length === 0) {
      hasFetchedCategories.current = true;
      dispatch(fetchCategories());
    }
  }, [dispatch]);

  // Fetch products for the first category when categories are loaded
  useEffect(() => {
    if (safeCategories.length > 0) {
      // Fetch products for all categories on mount
      safeCategories.forEach(category => {
        if (category && category._id) {
          dispatch(fetchProductsByCategory(category._id));
        }
      });
    }
  }, [dispatch, safeCategories.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>BESTEA - Premium Tea Collection | Fresh from Assam Gardens</title>
        <meta name="description" content="Discover premium quality teas from Assam's finest gardens. Shop our collection of black tea, green tea, and specialty blends." />
      </Helmet>

      {/* Category Pills Section - Above Banner */}
      <section className="bg-white py-4 border-b-2 border-gray-100 relative overflow-hidden shadow-sm">
        {/* Subtle dotted pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #9ACB3C 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            {/* Shop All Category */}
            <Link
              to="/shop"
              className="flex-shrink-0 group"
            >
              <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 rounded-full px-6 py-3 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-green-300 transition-all">
                  <img
                    src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop&q=80"
                    alt="Shop All"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-gray-800 group-hover:text-green-700 transition-colors whitespace-nowrap">
                  Shop All
                </span>
              </div>
            </Link>

            {/* Dynamic Categories */}
            {isLoading ? (
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 animate-pulse">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-6 py-3 w-48 h-18"></div>
                  </div>
                ))}
              </div>
            ) : (
              safeCategories.slice(0, 6).map((category, index) => (
                <Link
                  key={category._id || index}
                  to={`/shop?category=${category.slug || category._id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 rounded-full px-6 py-3 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-green-300 transition-all">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-${1597318181409 + index * 50000}-cf64d0b3471a?w=100&h=100&fit=crop&q=80`;
                          }}
                        />
                      ) : (
                        <FaLeaf className="text-green-600 text-xl" />
                      )}
                    </div>
                    <span className="font-bold text-gray-800 group-hover:text-green-700 transition-colors whitespace-nowrap">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Hero Banner Section - Professional Enhanced */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-green-50/30 py-12 lg:py-20 overflow-hidden border-b-2 border-gray-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239ACB3C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-green-100 to-teal-100 rounded-full opacity-15 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content - Enhanced Typography */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-1"
            >
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 text-sm font-medium mb-6 shadow-md">
                <FaLeaf className="text-sm" />
                <span>Premium Collection</span>
              </div>
              
              {/* Main Heading - Clean and Professional */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Premium Tea
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Collection
                </span>
              </h1>
              
              {/* Clean Subtitle */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Handcrafted teas from the finest gardens of Assam. 
                Experience authentic flavors in every cup.
              </p>
              
              {/* Simple Trust Indicators */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-600" />
                  <span className="text-sm text-gray-700">100% Organic</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTruck className="text-green-600" />
                  <span className="text-sm text-gray-700">Free Delivery</span>
                </div>
              </div>
              
              {/* Clean CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/shop"
                  className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <FaShoppingCart className="group-hover:scale-110 transition-transform" />
                  <span>Shop Now</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Auto Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-2"
            >
              <HeroCarousel featuredProducts={safeFeaturedProducts} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brew India In Every Cup - Features Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden border-b-2 border-green-100">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Brew India In Every Cup
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Delightful Flavours, Rich Heritage, Timeless Craft
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Single-Origin */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-2 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
                    <svg className="w-14 h-14 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18M5 10v10h14V10" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6V4m6 2V4" />
                    </svg>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4"></div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-green-700">
                  Single-Origin
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sourced from premium single estates
                </p>
              </div>
            </motion.div>

            {/* Premium Quality */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-2 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
                    <svg className="w-14 h-14 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4"></div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-green-700">
                  Premium Quality
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Handpicked finest tea leaves
                </p>
              </div>
            </motion.div>

            {/* Freshly Packed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-2 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
                    <svg className="w-14 h-14 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 0v4m0-4h4m-4 0H8" />
                    </svg>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4"></div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-green-700">
                  Freshly Packed
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sealed for maximum freshness
                </p>
              </div>
            </motion.div>

            {/* No Additives */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 transform hover:-translate-y-2 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
                    <svg className="w-14 h-14 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
                    </svg>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4"></div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-green-700">
                  No Additives
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  100% pure & natural ingredients
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Discover Our Bestsellers Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239ACB3C' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-green-100 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-100 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Discover Our Bestsellers
              </h2>
            </motion.div>

            {/* Category Filter Dropdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <select
                className="appearance-none px-6 py-3 pr-10 rounded-lg font-semibold text-white cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-bestea-400 focus:ring-offset-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                value={selectedCategory}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  setSelectedCategory(categoryId);
                  
                  // Fetch products if not already cached
                  if (categoryId !== 'all' && (!categoryProducts[categoryId] || !categoryProducts[categoryId].data)) {
                    dispatch(fetchProductsByCategory(categoryId));
                  }
                }}
              >
                <option className='text-black' value="all">All Categories</option>
                {safeCategories.map((category) => (
                  <option key={category._id} value={category._id} className='text-black'>
                    {category.name}
                  </option>
                ))}
              </select>
              {/* Dropdown Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-100">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded-full w-20 mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaLeaf className="text-4xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No products available at the moment.' 
                  : 'No products available in this category. Try selecting a different category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {displayedProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-green-300"
                >
                  {/* Wishlist Button - Top Right */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className={`absolute top-4 right-4 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:bg-green-400 hover:scale-110 ${
                      isInWishlist(product._id) 
                        ? 'opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <FaHeart 
                      className={`text-xl transition-colors ${
                        isInWishlist(product._id) 
                          ? 'text-red-500' 
                          : 'text-gray-600 group-hover:text-white'
                      }`} 
                    />
                  </button>

                  {/* Product Image Container - Clickable */}
                  <Link 
                    to={`/product/${product._id}`} 
                    className="block relative cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {/* Badges - Top Left */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.originalPrice && product.price < product.originalPrice && (
                          <div className="bg-red-500 text-white px-3 py-1.5 text-sm font-bold rounded-md shadow-lg">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                        {product.badges?.includes('Best Seller') && (
                          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1.5 text-sm font-bold rounded-md shadow-lg">
                            ⭐ Bestseller
                          </div>
                        )}
                        {product.badges?.includes('New') && (
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 text-sm font-bold rounded-md shadow-lg">
                            NEW
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-bold rounded-md shadow-lg">
                            OUT OF STOCK
                          </div>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={product.mainImage?.url || product.images?.[0]?.url || '/images/tea-placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.target.src = '/images/tea-placeholder.svg';
                          }}
                        />
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Quick View Badge - Bottom Center (appears on hover) */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-5 py-2 text-sm font-semibold rounded-full shadow-lg border border-gray-200">
                          Quick View
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5">
                    {/* Category Tag */}
                    <div className="mb-1">
                      <span className="inline-block bg-green-50 text-green-700 px-3 rounded-full text-xs font-medium">
                        {product.category?.name || 'Tea'}
                      </span>
                    </div>

                    {/* Product Title - Clickable */}
                    <Link 
                      to={`/product/${product._id}`}
                      className="block"
                    >
                      <h3 className="text-base font-semibold text-gray-900 mb-1 pl-2 line-clamp-2 min-h-[3rem] hover:text-green-400 transition-colors leading-snug cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-md">
                        <FaStar className="w-3.5 h-3.5 text-amber-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">
                          {(product.rating || product.averageRating || 4.3).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.reviewCount || product.numReviews || 124})
                      </span>
                    </div>

                    {/* Price Section */}
                    <div className="mb-1 pt-1 border-t border-gray-100">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.price < product.originalPrice && (
                          <span className="text-base text-gray-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && product.price < product.originalPrice && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Save ₹{product.originalPrice - product.price}
                        </p>
                      )}
                    </div>

                    {/* Stock Status / Delivery Info */}
                    {product.stock > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <FaTruck className="text-green-400 text-base" />
                        <span>Free delivery available</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <AddToCartButton 
                      product={{
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        mainImage: product.mainImage,
                        images: product.images,
                        defaultPrice: product.defaultPrice || product.price,
                        price: product.price,
                        stock: product.stock
                      }}
                      size="medium"
                    />
                  </div>

                  {/* Premium Border Effect */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/5 pointer-events-none"></div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Products Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg font-bold text-white text-base transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                View all our products
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* Testimonials Section - Dynamic from Database */}
      {safeFeaturedTestimonials && safeFeaturedTestimonials.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Customer <span className="text-green-600">Reviews</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear what our tea lovers have to say about their BESTEA experience
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {safeFeaturedTestimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-8 border-2 border-green-100 hover:border-green-300 shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-1">
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-green-200 group-hover:text-green-300 transition-colors" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                      </svg>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`text-lg ${i < testimonial.rating ? 'text-green-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1 line-clamp-4">
                      "{testimonial.comment}"
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex items-center pt-6 border-t border-gray-100">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {testimonial.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {testimonial.user?.name || 'Verified Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.product?.name || 'Tea Lover'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All Reviews Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/shop" className="btn btn-outline btn-lg group">
                <span>View All Reviews</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section - 1868 Style */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Tea Leaf Pattern Background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239ACB3C' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-green-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent" style={{ 
              fontFamily: 'Georgia, serif'
            }}>
              1868 Customer Reviews
            </h2>
          </motion.div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Review Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-300"
            >
              {/* Avatar and Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600">
                  AR
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Ananya Roy
                  </h3>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h4 className="font-bold text-green-700 italic mb-3">
                Authentic Chai Experience
              </h4>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed">
                This Kolkata Street chai takes me straight to the streets of Kolkata! The flavors are rich and comforting.
              </p>
            </motion.div>

            {/* Review Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-300"
            >
              {/* Avatar and Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600">
                  GM
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Geeta Mehta
                  </h3>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h4 className="font-bold text-green-700 italic mb-3">
                Convenience and quality tea bags
              </h4>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed">
                The convenience of tea bags with the quality of loose-leaf tea. The rose flavor is subtle and pairs well with the tea in this green with rose tea flavour.
              </p>
            </motion.div>

            {/* Review Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-300"
            >
              {/* Avatar and Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600">
                  AB
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Aditya Bose
                  </h3>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h4 className="font-bold text-green-700 italic mb-3">
                Strong Ginger Flavor
              </h4>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed">
                The ginger is quite overpowering for me in this lemongrass ginger chai, but it's still good quality.
              </p>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-4"
          >
            <button
              className="w-12 h-12 rounded-full border-2 border-green-600 text-green-600 flex items-center justify-center transition-all duration-300 hover:bg-green-100 hover:border-green-700 hover:text-green-700"
              aria-label="Previous reviews"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="w-12 h-12 rounded-full border-2 border-green-600 text-green-600 flex items-center justify-center transition-all duration-300 hover:bg-green-100 hover:border-green-700 hover:text-green-700"
              aria-label="Next reviews"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts />
    </div>
  );
};

export default Home;
