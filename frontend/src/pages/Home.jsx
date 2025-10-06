import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaLeaf, FaTruck, FaAward, FaArrowRight, FaShieldAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Store actions
import { fetchBestSellers, fetchFeaturedProducts, fetchCategories } from '../store/slices/productSlice';
import { fetchFeaturedTestimonials } from '../store/slices/reviewSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

// Category Product Carousel Component
const CategoryProductCarousel = ({ category, products, categoryIndex }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Only use products passed as props, do not use mock data
  const categoryProducts = (products && products.length > 0)
    ? products.filter((product) => product.category && (product.category._id === category._id || product.category.slug === category.slug)).slice(0, 8)
    : [];

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categoryProducts]);

  // Always render the carousel, even if no products (show message instead)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: categoryIndex * 0.1 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={category.image?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=100"}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{category.name}</h3>
            <p className="text-gray-600 text-sm md:text-base">{categoryProducts.length} products available</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Scroll Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border-2 transition-all ${
                canScrollLeft 
                  ? 'border-bestea-600 text-bestea-600 hover:bg-bestea-600 hover:text-white' 
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border-2 transition-all ${
                canScrollRight 
                  ? 'border-bestea-600 text-bestea-600 hover:bg-bestea-600 hover:text-white' 
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
          
          <Link
            to={`/category/${category.slug}`}
            className="bg-bestea-600 text-white px-4 py-2 rounded-lg hover:bg-bestea-700 transition-colors text-sm font-medium"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          onScroll={checkScrollability}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryProducts.length > 0 ? categoryProducts.map((product, index) => (
            <motion.div
              key={product._id || index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-64 md:w-72 group"
            >
              <Link to={`/product/${product?.slug || product?._id}`} className="block">
                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-bestea-200">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product?.mainImage?.url || product?.images?.[0]?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=300"}
                      alt={product?.name || "Premium Tea"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Product Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product?.onSale && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          SALE
                        </div>
                      )}
                      {product?.isFeatured && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                        <FaHeart className="text-gray-600 hover:text-red-500 transition-colors text-sm" />
                      </button>
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                        <FaShoppingCart className="text-bestea-600 text-sm" />
                      </button>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs font-medium">{product?.averageRating || 4.5}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-bestea-600 transition-colors line-clamp-1">
                      {product?.name || "Premium Tea"}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product?.shortDescription || "Rich, flavorful tea with exceptional quality"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product?.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">₹{product.salePrice}</span>
                            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">₹{product?.price || 299}</span>
                        )}
                      </div>
                      
                      <button className="bg-bestea-600 text-white px-3 py-1 rounded-lg hover:bg-bestea-700 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div className="flex-shrink-0 w-full text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="text-6xl mb-4">🍃</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Available</h3>
                <p className="text-gray-500 text-sm">Products for this category will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { bestSellers, featuredProducts, categories, isLoading } = useSelector(state => state.products);
  const { featuredTestimonials, isLoading: reviewsLoading } = useSelector(state => state.reviews);
  


  useEffect(() => {
    dispatch(fetchBestSellers());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
    dispatch(fetchFeaturedTestimonials());
  }, [dispatch]);

  // Remove the early return for loading to allow page to render with fallback data

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>BESTEA - Premium Tea Collection | Fresh from Assam Gardens</title>
        <meta name="description" content="Discover premium quality teas from Assam's finest gardens. Shop our collection of black tea, green tea, and specialty blends." />
      </Helmet>
      
      {/* Custom styles for carousel */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Categories Section - Enhanced and Prominent */}
      <section className="py-20 bg-gradient-to-br from-bestea-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-bestea-100 rounded-full px-4 py-2 mb-4">
              <FaLeaf className="text-bestea-600 mr-2" />
              <span className="text-sm font-medium text-bestea-700">Premium Collection</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Explore Our <span className="text-bestea-600">Tea Categories</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From traditional Assam black teas to aromatic green varieties, discover your perfect cup from our expertly curated selection
            </p>
          </motion.div>

          {/* Main Categories Grid - Large Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {categories && categories.length > 0 ? (
              categories.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/category/${category.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={category.image?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7"}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Category Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-bestea-200 transition-colors">{category.name}</h3>
                        <p className="text-sm opacity-90 mb-3">{category.description || "Premium quality teas"}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            {category.productCount || 0} products
                          </span>
                          <div className="flex items-center text-sm">
                            <span>Shop Now</span>
                            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">No categories available.</div>
            )}
          </div>

          {/* Quick Category Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {categories && categories.length > 0 ? (
              categories.slice(6, 12).map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:border-bestea-300 hover:text-bestea-600 transition-all"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">No categories found.</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/categories"
              className="inline-flex items-center bg-bestea-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-bestea-700 transition-all shadow-lg hover:shadow-xl"
            >
              <span>View All Categories</span>
              <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section - Enhanced E-commerce Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-orange-100 rounded-full px-4 py-2 mb-4">
              <FaStar className="text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-700">Bestsellers</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Featured <span className="text-orange-600">Tea Collection</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our most loved teas, carefully selected by tea connoisseurs and loved by thousands of customers worldwide
            </p>
          </motion.div>

          {/* Products Grid - Professional E-commerce Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {(featuredProducts || bestSellers || []).slice(0, 8).map((product, index) => (
              <motion.div
                key={product?._id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product?.slug || product?._id}`} className="block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-bestea-200 transform hover:-translate-y-1">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product?.mainImage?.url || product?.images?.[0]?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=400"}
                        alt={product?.name || "Premium Tea"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Product Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product?.onSale && (
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            SALE
                          </div>
                        )}
                        {product?.isFeatured && (
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            FEATURED
                          </div>
                        )}
                      </div>

                      {/* Quick Add Button */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                          <FaShoppingCart className="text-bestea-600 text-sm" />
                        </button>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-xs font-medium">{product?.averageRating || 4.5}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-bestea-600 bg-bestea-50 px-2 py-1 rounded">
                          {product?.category?.name || "Premium Tea"}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-bestea-600 transition-colors line-clamp-1">
                        {product?.name || "Premium Assam Tea"}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product?.shortDescription || "Rich, malty flavor with golden color and robust character"}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {product?.salePrice ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">₹{product.salePrice}</span>
                              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">₹{product?.price || 299}</span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button className="w-full bg-bestea-600 text-white py-2 rounded-lg font-medium hover:bg-bestea-700 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Product Category Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {categories && categories.length > 0 ? (
              categories.slice(0, 4).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/category/${category.slug}`}
                    className="block bg-gradient-to-r from-bestea-50 to-orange-50 p-6 rounded-xl text-center hover:from-bestea-100 hover:to-orange-100 transition-all border border-gray-100 hover:border-bestea-200"
                  >
                    <div className="text-2xl mb-2">🍃</div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Explore Collection</p>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">No categories found.</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center bg-bestea-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-bestea-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FaShoppingCart className="mr-2" />
                <span>Shop All Products</span>
                <FaArrowRight className="ml-2" />
              </Link>
              
              <Link
                to="/bestsellers"
                className="inline-flex items-center bg-white text-bestea-600 px-8 py-4 rounded-xl font-medium border border-bestea-200 hover:bg-bestea-50 transition-all shadow-lg hover:shadow-xl"
              >
                <FaStar className="mr-2" />
                <span>View Bestsellers</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category-wise Products Carousel Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Shop by <span className="text-bestea-600">Category</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our premium tea collection organized by your favorite categories
            </p>
          </motion.div>

          {/* Category Carousels */}
          <div className="space-y-12 md:space-y-16">
            {/* Loading state for categories */}
            {isLoading && (
              <div className="text-center p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            )}
            {categories && categories.length > 0 ? (
              categories.map((category, categoryIndex) => (
                <CategoryProductCarousel
                  key={category._id}
                  category={category}
                  products={featuredProducts || bestSellers || []}
                  categoryIndex={categoryIndex}
                />
              ))
            ) : (
              <div className="text-center text-gray-500">No categories to display.</div>
            )}
          </div>

          {/* View All Categories CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Explore More Categories
              </h3>
              <p className="text-gray-600 mb-6">
                Discover our complete collection of premium teas from around the world
              </p>
              <Link
                to="/categories"
                className="inline-flex items-center bg-bestea-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-bestea-700 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Browse All Categories</span>
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose BESTEA?</h2>
            <p className="text-gray-600">Quality and excellence in every cup</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: FaLeaf,
                title: 'Premium Quality',
                description: '100% natural tea leaves from Assam\'s finest gardens'
              },
              {
                icon: FaTruck,
                title: 'Free Shipping',
                description: 'Free delivery on orders above ₹499 across India'
              },
              {
                icon: FaAward,
                title: 'Expert Curation',
                description: 'Hand-selected teas by our tea masters for exceptional taste'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-bestea-100 rounded-full flex items-center justify-center">
                  <feature.icon className="text-bestea-600 text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {featuredTestimonials && featuredTestimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Customer Reviews</h2>
              <p className="text-gray-600">What our tea lovers say about us</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredTestimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-bestea-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-bestea-600 font-semibold text-sm">
                        {testimonial.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.user?.name || 'Customer'}</p>
                      <p className="text-sm text-gray-600">{testimonial.product?.name}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-bestea-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Tea Journey Today</h2>
          <p className="text-bestea-100 mb-8 max-w-2xl mx-auto">
            Join thousands of tea lovers who trust BESTEA for their daily cup of happiness
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center bg-white text-bestea-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Premium Teas
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
