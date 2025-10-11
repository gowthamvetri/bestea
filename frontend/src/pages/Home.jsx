import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaLeaf, FaTruck, FaAward, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

// Store actions
import { fetchBestSellers, fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchFeaturedTestimonials } from '../store/slices/reviewSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';



const Home = () => {
  const dispatch = useDispatch();
  const { bestSellers, featuredProducts, isLoading } = useSelector(state => state.products);
  const { featuredTestimonials, isLoading: reviewsLoading } = useSelector(state => state.reviews);
  

  useEffect(() => {
    dispatch(fetchBestSellers());
    dispatch(fetchFeaturedProducts());
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
            {(bestSellers || []).slice(0, 8).map((product, index) => (
              <motion.div
                key={product?._id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product?._id || product?.slug || 'demo'}`} className="block">
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
                        {product?.isBestseller && (
                          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            BESTSELLER
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
            
            {/* Fallback when no products available */}
            {(!bestSellers || bestSellers.length === 0) && (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <FaLeaf className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                  <p className="text-gray-500">
                    Our bestselling teas will appear here once they're added to the catalog.
                  </p>
                </div>
              </div>
            )}
          </div>



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
                to="/shop?bestseller=true"
                className="inline-flex items-center bg-white text-bestea-600 px-8 py-4 rounded-xl font-medium border border-bestea-200 hover:bg-bestea-50 transition-all shadow-lg hover:shadow-xl"
              >
                <FaStar className="mr-2" />
                <span>View Bestsellers</span>
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
