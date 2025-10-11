import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaChevronLeft, FaChevronRight, FaArrowRight, FaHeart } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './CategoryProductSlider.css';

import { fetchCategories, fetchProductsByCategory } from '../../store/slices/productSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryProductSlider = () => {
  const dispatch = useDispatch();
  const { categories, categoryProducts, isLoading } = useSelector(state => state.products);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    // Fetch categories on component mount
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Fetch products for each category
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        if (category._id && !categoryProducts[category._id]) {
          dispatch(fetchProductsByCategory(category._id));
        }
      });
    }
  }, [categories, dispatch, categoryProducts]);

  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner variant="tea" size="large" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full px-5 py-2.5 mb-6 shadow-sm">
            <FaStar className="text-orange-600" />
            <span className="text-sm font-semibold text-orange-700 tracking-wide">Explore by Category</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Shop by <span className="text-gradient-primary">Tea Categories</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated collection of premium teas, organized by type and flavor profile
          </p>
        </motion.div>

        {/* Category-wise Product Sliders */}
        <div className="space-y-16">
          {categories.map((category, index) => {
            const products = categoryProducts[category._id]?.data || [];
            
            if (!products || products.length === 0) return null;

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="category-section"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-gray-100">
                  <div className="flex items-center gap-5">
                    {category.image?.url && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-200 shadow-lg">
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {category.name}
                        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                          {products.length} products
                        </span>
                      </h3>
                      <p className="text-gray-600 text-base max-w-2xl">
                        {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/shop?category=${category.slug || category._id}`}
                    className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg group"
                  >
                    <span>View All</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>

                {/* Products Slider */}
                <div className="relative category-slider">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{
                      prevEl: `.prev-${category._id}`,
                      nextEl: `.next-${category._id}`,
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                      640: {
                        slidesPerView: 2,
                        spaceBetween: 16,
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                      },
                    }}
                    className="product-swiper pb-12"
                  >
                    {products.map((product) => (
                      <SwiperSlide key={product._id}>
                        <ProductCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <button
                    className={`prev-${category._id} absolute left-0 top-1/3 -translate-y-1/2 -translate-x-1/2 z-10 
                               bg-white shadow-xl rounded-full p-4 
                               hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white 
                               transition-colors duration-300 hidden lg:flex items-center justify-center
                               border-2 border-gray-100 hover:border-orange-500 hover:shadow-2xl`}
                  >
                    <FaChevronLeft className="text-xl" />
                  </button>
                  <button
                    className={`next-${category._id} absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 z-10 
                               bg-white shadow-xl rounded-full p-4 
                               hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white 
                               transition-colors duration-300 hidden lg:flex items-center justify-center
                               border-2 border-gray-100 hover:border-orange-500 hover:shadow-2xl`}
                  >
                    <FaChevronRight className="text-xl" />
                  </button>
                </div>

                {/* Mobile View All Link */}
                <div className="mt-8 md:hidden text-center">
                  <Link
                    to={`/shop?category=${category.slug || category._id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>View All {category.name}</span>
                    <FaArrowRight />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  return (
    <div className="group h-full">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
        {/* Product Image Container */}
        <Link to={`/product/${product._id}`} className="relative block overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="aspect-square relative">
            <img
              src={product.mainImage?.url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=400"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Product Badges - Top Left */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.onSale && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  SALE
                </span>
              )}
              {product.isBestseller && (
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <FaStar className="text-xs" />
                  BESTSELLER
                </span>
              )}
              {product.isFeatured && !product.isBestseller && (
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  FEATURED
                </span>
              )}
            </div>

            {/* Quick Actions - Top Right */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <button 
                className="p-2.5 bg-white rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  // Add to wishlist logic here
                }}
                aria-label="Add to wishlist"
              >
                <FaHeart className="text-sm" />
              </button>
              <button 
                className="p-2.5 bg-white rounded-full shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  // Quick add to cart logic here
                }}
                aria-label="Quick add to cart"
              >
                <FaShoppingCart className="text-sm" />
              </button>
            </div>

            {/* Rating Badge - Bottom Right */}
            {product.averageRating > 0 && (
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
              {product.category?.name || "Premium Tea"}
            </span>
          </div>
          
          {/* Product Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
          </Link>
          
          {/* Product Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {product.shortDescription || product.description || "Premium quality tea"}
          </p>
          
          {/* Price and Action Section */}
          <div className="mt-auto space-y-3">
            {/* Price Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-bold text-gray-900">₹{product.salePrice}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                )}
              </div>
              
              {/* Discount Badge */}
              {product.salePrice && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                  -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-1.5 text-xs">
              {product.stock > 20 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock</span>
                </>
              ) : product.stock > 0 ? (
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
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
              }}
              disabled={!product.stock || product.stock === 0}
            >
              <FaShoppingCart className="text-sm group-hover/btn:scale-110 transition-transform" />
              <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductSlider;
