import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Initial state
const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  bestSellers: [],
  newArrivals: [],
  featuredProducts: [],
  categoryProducts: {}, // Object to store products by category ID
  searchResults: [],
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
  isLoading: false,
  error: null,
  // Cache for reducing API calls
  lastFetchTime: {
    products: null,
    categories: null,
    bestSellers: null,
    featuredProducts: null,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/products?${queryString}`);
      return response.data;
    } catch (error) {
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        return rejectWithValue('Too many requests. Please wait a moment and try again.');
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Product not found'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Product not found'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check cache first - don't fetch if we have recent data
      const state = getState();
      const { categories, lastFetchTime } = state.products;
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (categories.length > 0 && lastFetchTime.categories && (now - lastFetchTime.categories < CACHE_DURATION)) {
        console.log('Using cached categories data');
        return categories;
      }
      
      console.log('Fetching categories from API...');
      const response = await axios.get(`${API_URL}/categories`);
      console.log('Categories API Response:', response.data);
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        return response.data.categories;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected categories response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        return rejectWithValue('Too many requests. Please wait a moment and try again.');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      );
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  'products/fetchBestSellers',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check cache first
      const state = getState();
      const { bestSellers, lastFetchTime } = state.products;
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (bestSellers.length > 0 && lastFetchTime.bestSellers && (now - lastFetchTime.bestSellers < CACHE_DURATION)) {
        console.log('Using cached bestsellers data');
        return bestSellers;
      }
      
      console.log('Fetching bestsellers from API...');
      const response = await axios.get(`${API_URL}/products/bestsellers`);
      console.log('Bestsellers API Response:', response.data);
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        return response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected bestsellers response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Bestsellers fetch error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bestsellers'
      );
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/new-arrivals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch new arrivals'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check cache first
      const state = getState();
      const { featuredProducts, lastFetchTime } = state.products;
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (featuredProducts.length > 0 && lastFetchTime.featuredProducts && (now - lastFetchTime.featuredProducts < CACHE_DURATION)) {
        console.log('Using cached featured products data');
        return featuredProducts;
      }
      
      console.log('Fetching featured products from API...');
      const response = await axios.get(`${API_URL}/products/featured`);
      console.log('Featured Products API Response:', response.data);
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        return response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected featured products response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Featured products fetch error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured products'
      );
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products?category=${categoryId}&limit=8`);
      console.log(`Category ${categoryId} Products API Response:`, response.data);
      
      // Normalize the response to ensure we have an array
      let productsArray = [];
      if (Array.isArray(response.data)) {
        productsArray = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        productsArray = response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productsArray = response.data.data;
      } else {
        console.warn('Unexpected products by category response format:', response.data);
      }
      
      return { categoryId, products: productsArray };
    } catch (error) {
      console.error(`Category ${categoryId} products fetch error:`, error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products by category'
      );
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed'
      );
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        priceRange: [0, 1000],
        rating: 0,
        sortBy: 'newest',
        inStock: false,
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload.product;
        state.error = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentProduct = null;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentProduct = null;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always store an array
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
        } else if (action.payload?.categories) {
          state.categories = action.payload.categories;
        } else if (action.payload?.data) {
          state.categories = action.payload.data;
        } else {
          state.categories = [];
        }
        state.lastFetchTime.categories = Date.now();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.categories = [];
      })
      // Fetch bestsellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and object responses
        if (Array.isArray(action.payload)) {
          state.bestSellers = action.payload;
        } else if (action.payload?.products) {
          state.bestSellers = action.payload.products;
        } else if (action.payload?.data) {
          state.bestSellers = action.payload.data;
        } else {
          state.bestSellers = [];
        }
        state.lastFetchTime.bestSellers = Date.now();
        state.error = null;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.bestSellers = [];
      })
      // Fetch new arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both formats
        if (Array.isArray(action.payload)) {
          state.newArrivals = action.payload;
        } else if (action.payload?.products) {
          state.newArrivals = action.payload.products;
        } else if (action.payload?.data) {
          state.newArrivals = action.payload.data;
        } else {
          state.newArrivals = [];
        }
        state.error = null;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.newArrivals = [];
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both array and object responses
        if (Array.isArray(action.payload)) {
          state.featuredProducts = action.payload;
        } else if (action.payload?.products) {
          state.featuredProducts = action.payload.products;
        } else if (action.payload?.data) {
          state.featuredProducts = action.payload.data;
        } else {
          state.featuredProducts = [];
        }
        state.lastFetchTime.featuredProducts = Date.now();
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.featuredProducts = [];
      })
      // Fetch products by category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryId, products } = action.payload;
        // Store products with proper structure
        const productData = Array.isArray(products) ? products : (products?.products || products?.data || []);
        state.categoryProducts[categoryId] = {
          data: productData,
          lastFetch: new Date().toISOString()
        };
        state.error = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentProduct,
  clearSearchResults,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectCategories = (state) => state.products.categories;
export const selectBestSellers = (state) => state.products.bestSellers;
export const selectNewArrivals = (state) => state.products.newArrivals;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectProductFilters = (state) => state.products.filters;
export const selectProductPagination = (state) => state.products.pagination;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;

export default productSlice.reducer;
