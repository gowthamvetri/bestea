import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useCallback } from 'react';
import {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetBestSellersQuery,
  useGetFeaturedProductsQuery,
  useSearchProductsQuery,
  useGetCategoriesQuery,
} from '../store/api/apiSlice';
import {
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTotal,
  selectCartGrandTotal,
  selectIsInCart,
  addToCart,
  removeFromCart,
  updateQuantity,
} from '../store/slices/cartSliceOptimized';
import {
  selectProducts,
  selectFilteredProducts,
  selectCurrentProduct,
  selectFilters,
  setFilters,
} from '../store/slices/productSliceOptimized';

// Enhanced cart hook with memoized calculations
export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const grandTotal = useSelector(selectCartGrandTotal);

  const cartActions = useMemo(() => ({
    addItem: (product, quantity = 1, selectedVariant = null) => 
      dispatch(addToCart({ product, quantity, selectedVariant })),
    
    removeItem: (productId, selectedVariant = null) => 
      dispatch(removeFromCart({ productId, selectedVariant })),
    
    updateItemQuantity: (productId, quantity, selectedVariant = null) => 
      dispatch(updateQuantity({ productId, quantity, selectedVariant })),
    
    isInCart: (productId, selectedVariant = null) => 
      items.some(item => 
        item.product._id === productId && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      ),
  }), [dispatch, items]);

  return {
    items,
    itemCount,
    subtotal,
    total,
    grandTotal,
    isEmpty: items.length === 0,
    ...cartActions,
  };
};

// Enhanced products hook with RTK Query
export const useProducts = (params = {}) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(params, {
    // Refresh data every 5 minutes
    pollingInterval: 5 * 60 * 1000,
    // Skip if no params and we have cached data
    skip: false,
  });

  const filters = useSelector(selectFilters);
  const dispatch = useDispatch();

  const productActions = useMemo(() => ({
    setFilters: (newFilters) => dispatch(setFilters(newFilters)),
    refetchProducts: refetch,
  }), [dispatch, refetch]);

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    filters,
    ...productActions,
  };
};

// Product detail hook with caching
export const useProduct = (productId, skip = false) => {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useGetProductByIdQuery(productId, {
    skip: !productId || skip,
    // Keep data for 10 minutes
    keepUnusedDataFor: 10 * 60,
  });

  return {
    product: data?.product,
    isLoading,
    error,
    refetch,
  };
};

// Best sellers hook with automatic caching
export const useBestSellers = () => {
  const {
    data,
    error,
    isLoading,
  } = useGetBestSellersQuery(undefined, {
    // Keep data for 15 minutes since it changes less frequently
    keepUnusedDataFor: 15 * 60,
  });

  return {
    bestSellers: data?.products || [],
    isLoading,
    error,
  };
};

// Featured products hook
export const useFeaturedProducts = () => {
  const {
    data,
    error,
    isLoading,
  } = useGetFeaturedProductsQuery(undefined, {
    keepUnusedDataFor: 15 * 60,
  });

  return {
    featuredProducts: data?.products || [],
    isLoading,
    error,
  };
};

// Search hook with debouncing
export const useProductSearch = () => {
  const [trigger, result] = useSearchProductsQuery();

  const search = useCallback((query) => {
    if (query && query.trim().length >= 2) {
      trigger(query);
    }
  }, [trigger]);

  return {
    search,
    results: result.data?.products || [],
    isLoading: result.isLoading,
    error: result.error,
  };
};

// Categories hook
export const useCategories = () => {
  const {
    data,
    error,
    isLoading,
  } = useGetCategoriesQuery(undefined, {
    // Categories change rarely, cache for 30 minutes
    keepUnusedDataFor: 30 * 60,
  });

  return {
    categories: data?.categories || [],
    isLoading,
    error,
  };
};

// Wishlist hook (assuming similar structure to cart)
export const useWishlist = () => {
  const dispatch = useDispatch();
  const items = useSelector(state => state.wishlist.items);

  const wishlistActions = useMemo(() => ({
    addToWishlist: (product) => 
      dispatch({ type: 'wishlist/addToWishlist', payload: product }),
    
    removeFromWishlist: (productId) => 
      dispatch({ type: 'wishlist/removeFromWishlist', payload: productId }),
    
    isInWishlist: (productId) => 
      items.some(item => item._id === productId),
    
    clearWishlist: () => 
      dispatch({ type: 'wishlist/clearWishlist' }),
  }), [dispatch, items]);

  return {
    items,
    itemCount: items.length,
    isEmpty: items.length === 0,
    ...wishlistActions,
  };
};

// Auth hook with user data
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading } = useSelector(state => state.auth);

  const authActions = useMemo(() => ({
    login: (credentials) => 
      dispatch({ type: 'auth/login', payload: credentials }),
    
    logout: () => 
      dispatch({ type: 'auth/logout' }),
    
    register: (userData) => 
      dispatch({ type: 'auth/register', payload: userData }),
  }), [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    ...authActions,
  };
};

// UI state hook for global UI states
export const useUI = () => {
  const dispatch = useDispatch();
  const ui = useSelector(state => state.ui);

  const uiActions = useMemo(() => ({
    showNotification: (message, type = 'info') => 
      dispatch({ 
        type: 'ui/addNotification', 
        payload: { id: Date.now(), message, type } 
      }),
    
    hideNotification: (id) => 
      dispatch({ type: 'ui/removeNotification', payload: id }),
    
    setLoading: (isLoading) => 
      dispatch({ type: 'ui/setLoading', payload: isLoading }),
    
    toggleMobileMenu: () => 
      dispatch({ type: 'ui/toggleMobileMenu' }),
  }), [dispatch]);

  return {
    ...ui,
    ...uiActions,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const cartItemCount = useSelector(selectCartItemCount);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  // Monitor key metrics
  const metrics = useMemo(() => ({
    cartItems: cartItemCount,
    userSession: isAuthenticated,
    timestamp: Date.now(),
  }), [cartItemCount, isAuthenticated]);

  return metrics;
};
