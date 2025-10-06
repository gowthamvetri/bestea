import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlist')) || [],
  isLoading: false,
  error: null,
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
          image: product.mainImage?.url || product.images?.[0]?.url,
          price: product.defaultPrice || product.price,
          originalPrice: product.defaultOriginalPrice || product.originalPrice,
          averageRating: product.averageRating,
          totalReviews: product.totalReviews,
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
      state.items = savedWishlist;
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
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  initializeWishlist,
  toggleWishlist,
} = wishlistSlice.actions;

// Selectors
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some(item => item._id === productId);

export default wishlistSlice.reducer;
