import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaLayerGroup } from 'react-icons/fa';
import Card from '../common/Card';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';

// Global cache to prevent multiple fetches across component instances
const fetchCache = new Map();
const activeRequests = new Map();

const RelatedProducts = ({ currentProductId, categoryId, categoryName }) => {
  const dispatch = useDispatch();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent effect from running on unmount
    mountedRef.current = true;

    const fetchRelatedProducts = async () => {
      // Don't fetch if no category
      if (!categoryId) {
        setIsLoading(false);
        return;
      }

      const cacheKey = `${categoryId}`;
      
      // Check if we have cached data (valid for 5 minutes)
      const cached = fetchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        const filtered = cached.products.filter(p => p._id !== currentProductId).slice(0, 8);
        setRelatedProducts(filtered);
        setIsLoading(false);
        return;
      }

      // Check if there's already an active request for this category
      if (activeRequests.has(cacheKey)) {
        try {
          const products = await activeRequests.get(cacheKey);
          if (mountedRef.current) {
            const filtered = products.filter(p => p._id !== currentProductId).slice(0, 8);
            setRelatedProducts(filtered);
            setIsLoading(false);
          }
        } catch (error) {
          if (mountedRef.current) {
            setHasError(true);
            setIsLoading(false);
          }
        }
        return;
      }

      // Create new request promise
      const requestPromise = dispatch(fetchProducts({ category: categoryId, limit: 9 }))
        .unwrap()
        .then(result => {
          const products = result.products || [];
          // Cache the result
          fetchCache.set(cacheKey, {
            products,
            timestamp: Date.now()
          });
          // Clean up active request
          activeRequests.delete(cacheKey);
          return products;
        })
        .catch(error => {
          // Clean up active request
          activeRequests.delete(cacheKey);
          throw error;
        });

      // Store the active request
      activeRequests.set(cacheKey, requestPromise);
      setIsLoading(true);
      setHasError(false);

      try {
        const products = await requestPromise;
        if (mountedRef.current) {
          const filtered = products.filter(p => p._id !== currentProductId).slice(0, 8);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.error('Error fetching related products:', error);
          setHasError(true);
          setRelatedProducts([]);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchRelatedProducts();

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [categoryId, currentProductId, dispatch]);

  // Don't render if no related products and not loading
  if (!isLoading && relatedProducts.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLayerGroup className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Related Products</h3>
              <p className="text-gray-500 mb-4">We couldn't find similar products at the moment.</p>
              {categoryId && (
                <Link
                  to={`/shop?category=${categoryId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200"
                >
                  Browse {categoryName || 'Category'}
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Don't render if error occurred
  if (hasError && relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaLayerGroup className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
              <p className="text-gray-600">
                {categoryName ? `More from ${categoryName}` : 'Similar products you might enjoy'}
              </p>
            </div>
          </div>
          {categoryId && (
            <Link
              to={`/shop?category=${categoryId}`}
              className="hidden md:flex items-center gap-2 px-6 py-3 text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              View All
              <FaArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded-full w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product, index) => (
              <Card.Product
                key={product._id || index}
                product={{
                  ...product,
                  images: product.mainImage?.url ? [product.mainImage.url] : [product.image || '/images/tea-placeholder.svg'],
                  price: product.defaultPrice || product.price,
                  originalPrice: product.defaultOriginalPrice || product.originalPrice,
                  rating: product.averageRating || product.rating || 0,
                  reviewCount: product.reviewCount || 0,
                  isNew: product.badges?.includes('New'),
                  isFeatured: product.badges?.includes('Best Seller'),
                  discount: product.defaultOriginalPrice ? Math.round(((product.defaultOriginalPrice - product.defaultPrice) / product.defaultOriginalPrice) * 100) : 0
                }}
                delay={index}
              />
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        {categoryId && !isLoading && (
          <div className="md:hidden mt-8 text-center">
            <Link
              to={`/shop?category=${categoryId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View All in {categoryName}
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// Memoize component and only re-render if props actually change
export default React.memo(RelatedProducts, (prevProps, nextProps) => {
  return (
    prevProps.currentProductId === nextProps.currentProductId &&
    prevProps.categoryId === nextProps.categoryId &&
    prevProps.categoryName === nextProps.categoryName
  );
});
