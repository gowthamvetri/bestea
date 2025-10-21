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

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    // Fetch categories on component mount
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Fetch products for each category
    if (safeCategories && safeCategories.length > 0) {
      safeCategories.forEach(category => {
        if (category._id && !categoryProducts[category._id]) {
          dispatch(fetchProductsByCategory(category._id));
        }
      });
    }
  }, [safeCategories, dispatch, categoryProducts]);

  if (isLoading && safeCategories.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner variant="tea" size="large" />
      </div>
    );
  }

  if (safeCategories.length === 0) {
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 rounded-full px-5 py-2.5 mb-6 shadow-sm">
            <FaStar className="text-green-600" />
            <span className="text-sm font-semibold text-green-700 tracking-wide">Explore by Category</span>
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
          {safeCategories.map((category, index) => {
            // Ensure products is always an array
            const categoryData = categoryProducts[category._id]?.data;
            const products = Array.isArray(categoryData) ? categoryData : [];
            
            if (products.length === 0) return null;

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
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200 shadow-lg">
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
                    className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-semibold hover:bg-green-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg group"
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
                               hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white 
                               transition-colors duration-300 hidden lg:flex items-center justify-center
                               border-2 border-gray-100 hover:border-green-500 hover:shadow-2xl`}
                  >
                    <FaChevronLeft className="text-xl" />
                  </button>
                  <button
                    className={`next-${category._id} absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 z-10 
                               bg-white shadow-xl rounded-full p-4 
                               hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white 
                               transition-colors duration-300 hidden lg:flex items-center justify-center
                               border-2 border-gray-100 hover:border-green-500 hover:shadow-2xl`}
                  >
                    <FaChevronRight className="text-xl" />
                  </button>
                </div>

                {/* Mobile View All Link */}
                <div className="mt-8 md:hidden text-center">
                  <Link
                    to={`/shop?category=${category.slug || category._id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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

// Import Card component
import Card from '../common/Card';

// Product Card Component - Using professional Card.Product
const ProductCard = ({ product }) => {
  return (
    <Card.Product
      product={{
        ...product,
        images: product.mainImage?.url ? [product.mainImage.url] : 
                product.images?.[0]?.url ? [product.images[0].url] : 
                ["https://images.unsplash.com/photo-1597318181409-8ead2e8d9da7?w=400"],
        price: product.salePrice || product.price,
        originalPrice: product.salePrice ? product.price : null,
        rating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        isNew: false, // You can add this logic based on your data
        isFeatured: product.isBestseller || product.isFeatured,
        discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
      }}
      onAddToCart={() => {
        // Add to cart logic here
        console.log('Add to cart:', product.name);
      }}
      onAddToWishlist={() => {
        // Add to wishlist logic here
        console.log('Add to wishlist:', product.name);
      }}
      onViewDetails={() => {
        // Navigate to product details
        window.location.href = `/product/${product._id}`;
      }}
    />
  );
};

export default CategoryProductSlider;
