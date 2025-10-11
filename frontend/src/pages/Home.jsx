import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
import { fetchBestSellers, fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchFeaturedTestimonials } from '../store/slices/reviewSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryProductSlider from '../components/home/CategoryProductSlider';



const Home = () => {
  const dispatch = useDispatch();
  const { bestSellers, featuredProducts, isLoading } = useSelector(state => state.products);
  const { featuredTestimonials, isLoading: reviewsLoading } = useSelector(state => state.reviews);
  
  // Ensure bestSellers and featuredProducts are always arrays
  const safebestSellers = Array.isArray(bestSellers) ? bestSellers : [];
  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];

  useEffect(() => {
    dispatch(fetchBestSellers());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchFeaturedTestimonials());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>BESTEA - Premium Tea Collection | Fresh from Assam Gardens</title>
        <meta name="description" content="Discover premium quality teas from Assam's finest gardens. Shop our collection of black tea, green tea, and specialty blends." />
      </Helmet>

      {/* Hero Section - Professional & Modern */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50/30 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-lg mb-8 border border-green-200"
              >
                <FaLeaf className="text-green-600 text-lg" />
                <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">100% Organic & Natural</span>
                <FaCertificate className="text-orange-600 text-lg" />
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Premium Tea
                <br />
                <span className="text-gradient-primary">From the Heart</span>
                <br />
                of Assam
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Experience the finest selection of handpicked tea leaves, carefully curated for the perfect brew.
              </p>

              {/* Feature List */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10 text-left max-w-xl mx-auto lg:mx-0">
                {[
                  { icon: FaCheckCircle, text: 'Direct from Tea Gardens' },
                  { icon: FaCheckCircle, text: 'Expert Quality Control' },
                  { icon: FaCheckCircle, text: 'Free Shipping ₹499+' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="text-green-600 text-lg flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/shop"
                  className="btn btn-primary btn-lg group"
                >
                  <FaShoppingCart className="group-hover:scale-110 transition-transform" />
                  <span>Shop Now</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/about"
                  className="btn btn-outline btn-lg"
                >
                  <span>Learn Our Story</span>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex items-center justify-center lg:justify-start gap-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Tea Varieties</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Image Container */}
              <div className="relative">
                {/* Decorative Border */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl opacity-20 blur-xl"></div>
                
                {/* Image */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80"
                    alt="Premium Tea Collection"
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Floating Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <FaGift className="text-white text-xl" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Special Offer</div>
                        <div className="text-xs text-gray-600">20% Off First Order</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl hidden lg:block"
                >
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400 text-2xl" />
                    <div>
                      <div className="text-lg font-bold text-gray-900">4.8/5</div>
                      <div className="text-xs text-gray-600">2.5k Reviews</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Professional Design */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full px-5 py-2.5 mb-6 shadow-sm">
              <FaStar className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-700 tracking-wide">Bestsellers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="text-gradient-primary">Tea Collection</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our most loved teas, carefully selected by tea connoisseurs and loved by thousands of customers worldwide
            </p>
          </motion.div>

          {/* Products Grid - Enhanced Professional Layout */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner variant="tea" size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {safebestSellers.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product?._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group h-full"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                    {/* Product Image Container */}
                    <Link to={`/product/${product?._id || product?.slug || 'demo'}`} className="relative block overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="aspect-square relative">
                        <img
                          src={product?.mainImage?.url || product?.images?.[0]?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=400"}
                          alt={product?.name || "Premium Tea"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Product Badges - Top Left */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          {product?.onSale && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                              SALE
                            </span>
                          )}
                          {product?.isBestseller && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <FaStar className="text-xs" />
                              BESTSELLER
                            </span>
                          )}
                          {product?.isFeatured && !product?.isBestseller && (
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              FEATURED
                            </span>
                          )}
                        </div>

                        {/* Quick Actions - Top Right */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                            aria-label="Add to wishlist"
                          >
                            <FaHeart className="text-sm" />
                          </button>
                          <button 
                            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                            aria-label="Quick view"
                          >
                            <FaShoppingCart className="text-sm" />
                          </button>
                        </div>

                        {/* Rating Badge - Bottom Right */}
                        {product?.averageRating > 0 && (
                          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                            <FaStar className="text-yellow-400 text-xs" />
                            <span className="text-xs font-bold text-gray-900">{product.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                          </div>
                        )}
                      </div>
                    </Link>
                      
                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Category Badge */}
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-md border border-green-200">
                          {product?.category?.name || "Premium Tea"}
                        </span>
                      </div>
                      
                      {/* Product Title */}
                      <Link to={`/product/${product?._id || product?.slug || 'demo'}`}>
                        <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
                          {product?.name || "Premium Assam Tea"}
                        </h3>
                      </Link>
                      
                      {/* Product Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {product?.shortDescription || "Rich, malty flavor with golden color and robust character"}
                      </p>
                      
                      {/* Price and Action Section */}
                      <div className="mt-auto space-y-3">
                        {/* Price Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            {product?.salePrice ? (
                              <>
                                <span className="text-2xl font-bold text-gray-900">₹{product.salePrice}</span>
                                <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-gray-900">₹{product?.price || 299}</span>
                            )}
                          </div>
                          
                          {/* Discount Badge */}
                          {product?.salePrice && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                              -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-1.5 text-xs">
                          {product?.stock > 20 ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 font-medium">In Stock</span>
                            </>
                          ) : product?.stock > 0 ? (
                            <>
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-orange-700 font-medium">Only {product.stock} left</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-700 font-medium">Out of Stock</span>
                            </>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 group/btn"
                          disabled={!product?.stock || product?.stock === 0}
                        >
                          <FaShoppingCart className="text-sm group-hover/btn:scale-110 transition-transform" />
                          <span>{product?.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Fallback when no products available */}
              {safebestSellers.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-16">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 max-w-md mx-auto border border-gray-200">
                    <FaLeaf className="text-7xl text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No Products Available</h3>
                    <p className="text-gray-500 mb-6">
                      Our bestselling teas will appear here once they're added to the catalog.
                    </p>
                    <Link to="/shop" className="btn btn-primary">
                      Browse All Products
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="btn btn-primary btn-lg group"
              >
                <FaShoppingCart className="group-hover:scale-110 transition-transform" />
                <span>Shop All Products</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/shop?bestseller=true"
                className="btn btn-outline btn-lg group"
              >
                <FaStar className="group-hover:scale-110 transition-transform" />
                <span>View Bestsellers</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category-wise Product Sliders Section */}
      <CategoryProductSlider />

      {/* Why Choose Us Section - Professional Design */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 mb-6 shadow-sm border border-gray-200">
              <FaShieldAlt className="text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Our Promise</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-gradient-primary">BESTEA</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Quality, authenticity, and excellence in every cup
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: FaLeaf,
                title: 'Premium Quality',
                description: '100% natural tea leaves sourced directly from Assam\'s finest gardens. No additives, no compromises.',
                color: 'from-green-500 to-emerald-600',
                bgColor: 'bg-green-50',
                iconColor: 'text-green-600'
              },
              {
                icon: FaTruck,
                title: 'Free Shipping',
                description: 'Fast and reliable delivery on orders above ₹499 across India. Track your order in real-time.',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                iconColor: 'text-blue-600'
              },
              {
                icon: FaAward,
                title: 'Expert Curation',
                description: 'Each tea is hand-selected by our expert tea masters for exceptional taste and aroma.',
                color: 'from-orange-500 to-orange-600',
                bgColor: 'bg-orange-50',
                iconColor: 'text-orange-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group"
              >
                <div className="feature-box text-center h-full">
                  {/* Icon */}
                  <div className="relative inline-block mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity`}></div>
                    <div className={`relative w-20 h-20 mx-auto ${feature.bgColor} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <feature.icon className={`${feature.iconColor} text-3xl`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Line */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className={`w-16 h-1 bg-gradient-to-r ${feature.color} rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Features Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {[
              { icon: FaShieldAlt, text: 'Secure Payments', subtext: 'SSL Encrypted' },
              { icon: FaCertificate, text: 'Certified Organic', subtext: 'ISO Verified' },
              { icon: FaHeart, text: '10K+ Happy Customers', subtext: '4.8★ Rated' },
              { icon: FaGift, text: 'Free Samples', subtext: 'On Every Order' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                <item.icon className="text-3xl text-orange-600 mx-auto mb-3" />
                <div className="font-semibold text-gray-900 text-sm mb-1">{item.text}</div>
                <div className="text-xs text-gray-500">{item.subtext}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Professional Design */}
      {featuredTestimonials && featuredTestimonials.length > 0 && (
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
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full px-5 py-2.5 mb-6 shadow-sm">
                <FaStar className="text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Customer <span className="text-gradient-primary">Reviews</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Hear what our tea lovers have to say about their BESTEA experience
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredTestimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="card card-hover h-full flex flex-col">
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-orange-200 group-hover:text-orange-300 transition-colors" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                      </svg>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`text-lg ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
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
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
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

      {/* CTA Section - Professional Design */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700"></div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556 15.858 12.14 28 0zm0 16.97L44.142 29.112l-1.414 1.414L30 17.8 17.272 30.526 15.858 29.11 28 16.97zm0 16.97L44.142 46.082l-1.414 1.414L30 34.77 17.272 47.496 15.858 46.08 28 33.94z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-white/30">
              <FaGift className="text-white text-lg" />
              <span className="text-sm font-semibold text-white">Special Offer</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Start Your Tea Journey Today
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-orange-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of tea lovers who trust BESTEA for their daily cup of happiness
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              {[
                { icon: FaShieldAlt, text: 'Secure Checkout' },
                { icon: FaTruck, text: 'Free Delivery ₹499+' },
                { icon: FaGift, text: '20% Off First Order' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <item.icon className="text-3xl text-white mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">{item.text}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop" 
                className="group inline-flex items-center justify-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                <FaShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
                <span>Shop Premium Teas</span>
                <FaArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/about" 
                className="group inline-flex items-center justify-center gap-3 bg-transparent text-white px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                <FaLeaf className="text-xl group-hover:scale-110 transition-transform" />
                <span>Learn More</span>
              </Link>
            </div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-2 text-orange-100"
            >
              <FaStar className="text-yellow-300" />
              <span className="text-sm font-medium">Rated 4.8/5 by over 10,000 customers</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
