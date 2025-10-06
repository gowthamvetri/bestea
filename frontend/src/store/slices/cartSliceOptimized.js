import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, selectedVariant = null } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => 
          item.product._id === product._id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          selectedVariant,
          addedAt: Date.now(),
        });
      }
      state.lastUpdated = Date.now();
    },

    removeFromCart: (state, action) => {
      const { productId, selectedVariant = null } = action.payload;
      state.items = state.items.filter(
        item => 
          !(item.product._id === productId && 
            JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
      );
      state.lastUpdated = Date.now();
    },

    updateQuantity: (state, action) => {
      const { productId, quantity, selectedVariant = null } = action.payload;
      const item = state.items.find(
        item => 
          item.product._id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i !== item);
        } else {
          item.quantity = quantity;
        }
        state.lastUpdated = Date.now();
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.lastUpdated = Date.now();
    },

    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      state.lastUpdated = Date.now();
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.lastUpdated = Date.now();
    },

    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setCartError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// Memoized selectors for better performance
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

// Memoized calculated selectors
export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => {
    const price = item.selectedVariant?.price || item.product.price || 0;
    return total + (price * item.quantity);
  }, 0)
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectAppliedCoupon],
  (subtotal, coupon) => {
    let total = subtotal;
    
    if (coupon) {
      if (coupon.type === 'percentage') {
        total = subtotal * (1 - coupon.value / 100);
      } else if (coupon.type === 'fixed') {
        total = Math.max(0, subtotal - coupon.value);
      }
    }
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }
);

export const selectCartTax = createSelector(
  [selectCartSubtotal],
  (subtotal) => Math.round(subtotal * 0.1 * 100) / 100 // 10% tax
);

export const selectCartGrandTotal = createSelector(
  [selectCartTotal, selectCartTax],
  (total, tax) => Math.round((total + tax) * 100) / 100
);

export const selectCartItemById = createSelector(
  [selectCartItems, (state, productId, selectedVariant) => ({ productId, selectedVariant })],
  (items, { productId, selectedVariant }) =>
    items.find(item => 
      item.product._id === productId && 
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    )
);

export const selectIsInCart = createSelector(
  [selectCartItems, (state, productId, selectedVariant) => ({ productId, selectedVariant })],
  (items, { productId, selectedVariant }) =>
    items.some(item => 
      item.product._id === productId && 
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    )
);

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setCartLoading,
  setCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
