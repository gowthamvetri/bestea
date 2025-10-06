import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely parse localStorage cart data
const getInitialCartItems = () => {
  try {
    const stored = localStorage.getItem('cart');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse cart data from localStorage:', error);
    return [];
  }
};

const initialState = {
  items: getInitialCartItems(),
  totalQuantity: 0,
  totalAmount: 0,
  subtotal: 0,
  discount: 0,
  shippingCost: 0,
  tax: 0,
  appliedCoupon: null,
  isLoading: false,
  error: null,
  isCartModalOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, variant, quantity = 1 } = action.payload;
      
      // Validate product data
      if (!product || !product._id) {
        console.error('Invalid product data provided to addToCart:', product);
        return;
      }
      
      // Create unique item identifier
      const itemId = variant ? `${product._id}-${variant.name}` : product._id;
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
      } else {
        const price = variant ? variant.price : product.defaultPrice || product.price || 0;
        const newItem = {
          id: itemId,
          productId: product._id,
          name: product.name || 'Unknown Product',
          slug: product.slug || 'unknown',
          image: product.mainImage?.url || product.images?.[0]?.url || product.image || '/images/tea-placeholder.svg',
          price,
          originalPrice: variant ? variant.originalPrice : product.defaultOriginalPrice || product.originalPrice || price,
          variant: variant ? {
            name: variant.name || 'Default',
            weight: variant.weight || '',
          } : null,
          quantity,
          total: price * quantity,
          stock: variant ? variant.stock : product.stock || 0,
        };
        state.items.push(newItem);
      }
      
      // Update totals
      cartSlice.caseReducers.calculateTotals(state);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      
      cartSlice.caseReducers.calculateTotals(state);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        cartSlice.caseReducers.removeFromCart(state, { payload: itemId });
        return;
      }
      
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        item.total = item.price * quantity;
        
        cartSlice.caseReducers.calculateTotals(state);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },
    
    calculateTotals: (state) => {
      // Calculate quantity and subtotal
      state.totalQuantity = state.items.reduce((total, item) => {
        return total + (item?.quantity || 0);
      }, 0);
      
      state.subtotal = state.items.reduce((total, item) => {
        return total + (item?.total || 0);
      }, 0);
      
      // Calculate shipping (free shipping over ₹499)
      state.shippingCost = state.subtotal >= 499 ? 0 : 50;
      
      // Calculate tax (18% GST)
      state.tax = Math.round((state.subtotal * 18) / 100);
      
      // Calculate total amount (subtotal - discount + shipping + tax)
      state.totalAmount = state.subtotal - (state.discount || 0) + state.shippingCost + state.tax;
    },
    
    // Initialize cart from localStorage
    initializeCart: (state) => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      state.items = savedCart;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    // Update item stock (after successful order)
    updateItemStock: (state, action) => {
      const { itemId, newStock } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.stock = newStock;
      }
    },

    // Toggle cart modal
    toggleCartModal: (state) => {
      state.isCartModalOpen = !state.isCartModalOpen;
    },

    // Open cart modal
    openCartModal: (state) => {
      state.isCartModalOpen = true;
    },

    // Close cart modal
    closeCartModal: (state) => {
      state.isCartModalOpen = false;
    },

    // Apply coupon
    applyCoupon: (state, action) => {
      const coupon = action.payload;
      state.appliedCoupon = coupon;
      
      // Calculate discount
      if (coupon.type === 'percentage') {
        state.discount = Math.round((state.subtotal * coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        state.discount = Math.min(coupon.value, state.subtotal);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },

    // Remove coupon
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
      cartSlice.caseReducers.calculateTotals(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateTotals,
  initializeCart,
  updateItemStock,
  toggleCartModal,
  openCartModal,
  closeCartModal,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartItemById = (itemId) => (state) =>
  state.cart.items.find(item => item.id === itemId);

export default cartSlice.reducer;
