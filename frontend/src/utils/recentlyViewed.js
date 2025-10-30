/**
 * Track Recently Viewed Products Utility
 * Manages localStorage to store and retrieve recently viewed products
 */

const MAX_RECENT_PRODUCTS = 20; // Maximum number of products to track

/**
 * Add a product to recently viewed list
 * @param {Object} product - Product object to add
 */
export const addToRecentlyViewed = (product) => {
  try {
    if (!product || !product._id) {
      console.warn('Invalid product data for recently viewed');
      return;
    }

    // Create a simplified product object
    const simplifiedProduct = {
      _id: product._id || product.id,
      name: product.name,
      slug: product.slug,
      price: product.defaultPrice || product.price,
      originalPrice: product.defaultOriginalPrice || product.originalPrice,
      mainImage: product.mainImage,
      image: product.image,
      images: product.images,
      category: product.category,
      rating: product.averageRating || product.rating || 0,
      reviewCount: product.reviewCount || 0,
      badges: product.badges,
      stock: product.stock,
      viewedAt: new Date().toISOString()
    };

    // Get existing recent products
    const existing = localStorage.getItem('recentlyViewed');
    let recentProducts = existing ? JSON.parse(existing) : [];

    // Remove if product already exists (to re-add at the beginning)
    recentProducts = recentProducts.filter(p => p._id !== simplifiedProduct._id);

    // Add at the beginning
    recentProducts.unshift(simplifiedProduct);

    // Keep only the most recent items
    recentProducts = recentProducts.slice(0, MAX_RECENT_PRODUCTS);

    // Save back to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(recentProducts));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

/**
 * Get all recently viewed products
 * @returns {Array} Array of recently viewed products
 */
export const getRecentlyViewed = () => {
  try {
    const existing = localStorage.getItem('recentlyViewed');
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

/**
 * Clear all recently viewed products
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem('recentlyViewed');
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Get recently viewed products excluding specific product ID
 * @param {string} excludeId - Product ID to exclude
 * @param {number} limit - Maximum number of products to return
 * @returns {Array} Array of recently viewed products
 */
export const getRecentlyViewedExcluding = (excludeId, limit = 8) => {
  try {
    const products = getRecentlyViewed();
    return products.filter(p => p._id !== excludeId).slice(0, limit);
  } catch (error) {
    console.error('Error getting recently viewed excluding:', error);
    return [];
  }
};
