import React, { memo, useCallback } from 'react';
import { useProducts, useCart, useCategories } from '../hooks/useRedux';
import LoadingSpinner from '../common/LoadingSpinner';

// Memoized product card component for better performance
const ProductCard = memo(({ product }) => {
  const { addItem, isInCart, updateItemQuantity } = useCart();

  const handleAddToCart = useCallback(() => {
    if (isInCart(product._id)) {
      updateItemQuantity(product._id, 1); // Increase quantity
    } else {
      addItem(product, 1);
    }
  }, [product._id, addItem, isInCart, updateItemQuantity]);

  return (
    <div className="product-card">
      <img 
        src={product.image || '/images/tea-placeholder.svg'} 
        alt={product.name}
        loading="lazy"
      />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button 
        onClick={handleAddToCart}
        className={`btn ${isInCart(product._id) ? 'btn-secondary' : 'btn-primary'}`}
      >
        {isInCart(product._id) ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
  );
});

// Optimized product listing component
const OptimizedProductList = memo(() => {
  const { 
    products, 
    isLoading, 
    error, 
    filters, 
    setFilters 
  } = useProducts({
    page: 1,
    limit: 12,
  });

  const { categories } = useCategories();

  const handleCategoryFilter = useCallback((categoryId) => {
    setFilters({ category: categoryId });
  }, [setFilters]);

  const handleSortChange = useCallback((sortBy) => {
    setFilters({ sortBy });
  }, [setFilters]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="product-list-container">
      {/* Filters */}
      <div className="filters">
        <select 
          value={filters.category} 
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select 
          value={filters.sortBy} 
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Best Rated</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard 
            key={`${product._id}-${product.updatedAt}`} // Better key for re-renders
            product={product} 
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          No products found matching your criteria.
        </div>
      )}
    </div>
  );
});

export default OptimizedProductList;
