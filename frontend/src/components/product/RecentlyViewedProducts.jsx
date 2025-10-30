import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import Card from '../common/Card';

const RecentlyViewedProducts = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Get recently viewed products from localStorage
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed) {
      try {
        const products = JSON.parse(viewed);
        setRecentProducts(products.slice(0, 8)); // Show max 8 products
      } catch (error) {
        console.error('Error parsing recently viewed products:', error);
      }
    }
  }, []);

  // Don't render if no products
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaClock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600">Products you've recently explored</p>
            </div>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 px-6 py-3 text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            View All
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product, index) => (
            <Card.Product
              key={product._id || index}
              product={product}
              delay={index}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View All Products
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;
