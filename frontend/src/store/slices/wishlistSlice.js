import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to migrate old wishlist items
const migrateWishlistItems = (items) => {
  return items.map(item => ({
    _id: item._id,
    name: item.name || 'Product',
    slug: item.slug,
    // Ensure both mainImage and image are available
    mainImage: item.mainImage || (item.image ? { url: item.image } : null),
    images: item.images || (item.image ? [{ url: item.image }] : []),
    image: item.image || item.mainImage?.url || item.images?.[0]?.url,
    price: item.price || 0,
    originalPrice: item.originalPrice,
    averageRating: item.averageRating || item.rating,
    totalReviews: item.totalReviews || item.reviewCount,
    rating: item.rating || item.averageRating || 0,
    reviewCount: item.reviewCount || item.totalReviews || 0,
    description: item.description,
    category: item.category,
    tags: item.tags || [],
    stock: item.stock !== undefined ? item.stock : 10,
    inStock: item.inStock !== undefined ? item.inStock : (item.stock !== undefined ? item.stock > 0 : true),
    addedAt: item.addedAt || new Date().toISOString(),
  }));
};

// Async thunks for API calls
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        // Return localStorage data if not authenticated
        const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        return migrateWishlistItems(localWishlist);
      }

      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAPI = createAsyncThunk(
  'wishlist/addToWishlistAPI',
  async (product, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        // Handle localStorage for non-authenticated users
        return product;
      }

      const response = await axios.post(
        `${API_URL}/wishlist`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistAPI = createAsyncThunk(
  'wishlist/removeFromWishlistAPI',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        // Handle localStorage for non-authenticated users
        return productId;
      }

      const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const syncWishlistToAPI = createAsyncThunk(
  'wishlist/syncWishlistToAPI',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth, wishlist } = getState();
      if (!auth.token) {
        console.log('No auth token, skipping wishlist sync');
        return wishlist.items;
      }

      const productIds = wishlist.items.map(item => item._id).filter(Boolean);
      
      if (productIds.length === 0) {
        console.log('No items to sync');
        return [];
      }

      console.log('Syncing wishlist with', productIds.length, 'items');
      
      const response = await axios.post(
        `${API_URL}/wishlist/sync`,
        { productIds },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      
      console.log('Wishlist sync successful:', response.data);
      return response.data.items || [];
    } catch (error) {
      console.error('Wishlist sync failed:', error);
      // Don't fail completely, just return current items
      const { wishlist } = getState();
      return wishlist.items;
    }
  }
);

const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
const initialState = {
  items: migrateWishlistItems(savedWishlist),
  isLoading: false,
  error: null,
  synced: false, // Track if synced with backend
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      
      // Check if product already exists
      const exists = state.items.find(item => item._id === product._id);
      
      if (!exists) {
        state.items.push({
          _id: product._id,
          name: product.name,
          slug: product.slug,
          // Store both mainImage and image for compatibility
          mainImage: product.mainImage,
          images: product.images,
          image: product.mainImage?.url || product.images?.[0]?.url || product.image,
          price: product.defaultPrice || product.price,
          originalPrice: product.defaultOriginalPrice || product.originalPrice,
          averageRating: product.averageRating,
          totalReviews: product.totalReviews,
          rating: product.rating || product.averageRating,
          reviewCount: product.reviewCount || product.totalReviews,
          description: product.description || product.shortDescription,
          category: product.category?.name || product.category,
          tags: product.tags || [],
          stock: product.stock,
          inStock: product.stock > 0,
          addedAt: new Date().toISOString(),
        });
        
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
    
    // Initialize wishlist from localStorage
    initializeWishlist: (state) => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      
      // Migrate old wishlist items to new format
      state.items = migrateWishlistItems(savedWishlist);
      
      // Save migrated data back to localStorage
      if (state.items.length > 0) {
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    
    // Toggle product in wishlist
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find(item => item._id === product._id);
      
      if (exists) {
        wishlistSlice.caseReducers.removeFromWishlist(state, { payload: product._id });
      } else {
        wishlistSlice.caseReducers.addToWishlist(state, { payload: product });
      }
    },
    
    // Set wishlist items (used after API fetch)
    setWishlistItems: (state, action) => {
      state.items = action.payload;
      state.synced = true;
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.synced = true;
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add to Wishlist
    builder
      .addCase(addToWishlistAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlistAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          // For localStorage fallback
          const exists = state.items.find(item => item._id === action.payload._id);
          if (!exists) {
            state.items.push(action.payload);
          }
        }
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(addToWishlistAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlistAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          // For localStorage fallback
          state.items = state.items.filter(item => item._id !== action.payload);
        }
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(removeFromWishlistAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Sync Wishlist
    builder
      .addCase(syncWishlistToAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncWishlistToAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.synced = true;
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      })
      .addCase(syncWishlistToAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Handle redux-persist REHYDRATE action
    builder.addMatcher(
      (action) => action.type === 'persist/REHYDRATE',
      (state, action) => {
        // If persisted wishlist is empty but localStorage has data, migrate it
        if (action.payload?.wishlist?.items) {
          state.items = migrateWishlistItems(action.payload.wishlist.items);
        } else {
          // Fallback to localStorage if persist is empty
          const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
          if (localWishlist.length > 0) {
            state.items = migrateWishlistItems(localWishlist);
            localStorage.setItem('wishlist', JSON.stringify(state.items));
          }
        }
      }
    );
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  initializeWishlist,
  toggleWishlist,
  setWishlistItems,
} = wishlistSlice.actions;

// Selectors
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some(item => item._id === productId);

export default wishlistSlice.reducer;
