import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Enhanced cache with timestamps
const createCacheEntry = (data) => ({
  data,
  timestamp: Date.now(),
  expires: Date.now() + (5 * 60 * 1000), // 5 minutes cache
});

const isCacheValid = (cacheEntry) => {
  return cacheEntry && cacheEntry.expires > Date.now();
};

// Async thunks with improved error handling and caching
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cacheKey = JSON.stringify(params);
      const cachedData = state.products.cache.products[cacheKey];
      
      // Return cached data if valid
      if (isCacheValid(cachedData)) {
        return { data: cachedData.data, fromCache: true };
      }

      const response = await axios.get(`${API_URL}/products`, { params });
      return { data: response.data, fromCache: false, cacheKey };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cachedProduct = state.products.cache.singleProducts[productId];
      
      // Return cached product if valid
      if (isCacheValid(cachedProduct)) {
        return { data: cachedProduct.data, fromCache: true };
      }

      const response = await axios.get(`${API_URL}/products/${productId}`);
      return { data: response.data, fromCache: false, productId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  'products/fetchBestSellers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cachedData = state.products.cache.bestSellers;
      
      if (isCacheValid(cachedData)) {
        return { data: cachedData.data, fromCache: true };
      }

      const response = await axios.get(`${API_URL}/products/bestsellers`);
      return { data: response.data, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch best sellers');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cachedData = state.products.cache.featuredProducts;
      
      if (isCacheValid(cachedData)) {
        return { data: cachedData.data, fromCache: true };
      }

      const response = await axios.get(`${API_URL}/products/featured`);
      return { data: response.data, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchQuery, { rejectWithValue }) => {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return { products: [] };
      }

      const response = await axios.get(`${API_URL}/products/search`, {
        params: { q: searchQuery }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cachedData = state.products.cache.categories;
      
      // Categories change rarely, so cache for longer
      if (cachedData && cachedData.expires > Date.now()) {
        return { data: cachedData.data, fromCache: true };
      }

      const response = await axios.get(`${API_URL}/categories`);
      return { data: response.data, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  bestSellers: [],
  featuredProducts: [],
  searchResults: [],
  
  // Enhanced caching system
  cache: {
    products: {}, // Keyed by query params
    singleProducts: {}, // Keyed by product ID
    bestSellers: null,
    featuredProducts: null,
    categories: null,
  },
  
  // Loading states
  loading: {
    products: false,
    currentProduct: false,
    bestSellers: false,
    featuredProducts: false,
    categories: false,
    search: false,
  },
  
  // Filters and pagination
  filters: {
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'newest',
    inStock: false,
  },
  
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  
  error: null,
  lastFetch: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Cache management
    clearCache: (state) => {
      state.cache = {
        products: {},
        singleProducts: {},
        bestSellers: null,
        featuredProducts: null,
        categories: null,
      };
    },
    
    // Optimistic updates for better UX
    optimisticUpdateProduct: (state, action) => {
      const { productId, updates } = action.payload;
      
      // Update in products list
      const productIndex = state.products.findIndex(p => p._id === productId);
      if (productIndex !== -1) {
        state.products[productIndex] = { ...state.products[productIndex], ...updates };
      }
      
      // Update current product
      if (state.currentProduct && state.currentProduct._id === productId) {
        state.currentProduct = { ...state.currentProduct, ...updates };
      }
      
      // Update in cache
      if (state.cache.singleProducts[productId]) {
        state.cache.singleProducts[productId].data = {
          ...state.cache.singleProducts[productId].data,
          ...updates
        };
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading.products = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        const { data, fromCache, cacheKey } = action.payload;
        
        if (data.success) {
          state.products = data.products || [];
          state.pagination = {
            ...state.pagination,
            total: data.total || 0,
            totalPages: data.totalPages || 0,
          };
          
          // Update cache if not from cache
          if (!fromCache && cacheKey) {
            state.cache.products[cacheKey] = createCacheEntry(data);
          }
        }
        state.lastFetch = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading.products = false;
        state.error = action.payload;
      })
      
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading.currentProduct = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading.currentProduct = false;
        const { data, fromCache, productId } = action.payload;
        
        if (data.success) {
          state.currentProduct = data.product;
          
          // Update cache if not from cache
          if (!fromCache && productId) {
            state.cache.singleProducts[productId] = createCacheEntry(data.product);
          }
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading.currentProduct = false;
        state.error = action.payload;
      })
      
      // Fetch Best Sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.loading.bestSellers = true;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loading.bestSellers = false;
        const { data, fromCache } = action.payload;
        
        if (data.success) {
          state.bestSellers = data.products || [];
          
          if (!fromCache) {
            state.cache.bestSellers = createCacheEntry(data);
          }
        }
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.loading.bestSellers = false;
        state.error = action.payload;
      })
      
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading.featuredProducts = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading.featuredProducts = false;
        const { data, fromCache } = action.payload;
        
        if (data.success) {
          state.featuredProducts = data.products || [];
          
          if (!fromCache) {
            state.cache.featuredProducts = createCacheEntry(data);
          }
        }
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading.featuredProducts = false;
        state.error = action.payload;
      })
      
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.loading.search = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.products || [];
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading.search = false;
        state.error = action.payload;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading.categories = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        const { data, fromCache } = action.payload;
        
        if (data.success) {
          state.categories = data.categories || [];
          
          if (!fromCache) {
            // Cache categories for 30 minutes
            state.cache.categories = {
              data,
              timestamp: Date.now(),
              expires: Date.now() + (30 * 60 * 1000),
            };
          }
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error = action.payload;
      });
  },
});

// Memoized selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectBestSellers = (state) => state.products.bestSellers;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectCategories = (state) => state.products.categories;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectFilters = (state) => state.products.filters;
export const selectPagination = (state) => state.products.pagination;
export const selectProductsLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;

// Complex memoized selectors
export const selectFilteredProducts = createSelector(
  [selectProducts, selectFilters],
  (products, filters) => {
    let filtered = [...products];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?.slug === filters.category ||
        product.category?._id === filters.category
      );
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
      );
    }
    
    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => 
        (product.averageRating || 0) >= filters.rating
      );
    }
    
    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => 
        product.stock > 0
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    return filtered;
  }
);

export const selectProductById = createSelector(
  [selectProducts, (state, productId) => productId],
  (products, productId) => products.find(product => product._id === productId)
);

export const selectRelatedProducts = createSelector(
  [selectProducts, selectCurrentProduct],
  (products, currentProduct) => {
    if (!currentProduct) return [];
    
    return products
      .filter(product => 
        product._id !== currentProduct._id &&
        product.category?._id === currentProduct.category?._id
      )
      .slice(0, 4);
  }
);

export const {
  setFilters,
  setPagination,
  clearSearchResults,
  clearCurrentProduct,
  clearError,
  clearCache,
  optimisticUpdateProduct,
} = productSlice.actions;

export default productSlice.reducer;
