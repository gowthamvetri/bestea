import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Navigation
  isMobileMenuOpen: false,
  isSearchOpen: false,
  
  // Modals
  isLoginModalOpen: false,
  isCartModalOpen: false,
  isSearchModalOpen: false,
  isQuickViewOpen: false,
  quickViewProduct: null,
  
  // Notifications
  notifications: [],
  
  // Loading states
  pageLoading: false,
  
  // Screen size
  screenSize: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  },
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Language
  language: localStorage.getItem('language') || 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
    
    // Modals
    toggleLoginModal: (state) => {
      state.isLoginModalOpen = !state.isLoginModalOpen;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
    toggleCartModal: (state) => {
      state.isCartModalOpen = !state.isCartModalOpen;
    },
    closeCartModal: (state) => {
      state.isCartModalOpen = false;
    },
    toggleSearchModal: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen;
    },
    openSearchModal: (state) => {
      state.isSearchModalOpen = true;
    },
    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
    },
    openQuickView: (state, action) => {
      state.isQuickViewOpen = true;
      state.quickViewProduct = action.payload;
    },
    closeQuickView: (state) => {
      state.isQuickViewOpen = false;
      state.quickViewProduct = null;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        createdAt: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    // Screen size
    setScreenSize: (state, action) => {
      state.screenSize = action.payload;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // Language
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // Close all modals
    closeAllModals: (state) => {
      state.isLoginModalOpen = false;
      state.isCartModalOpen = false;
      state.isSearchModalOpen = false;
      state.isQuickViewOpen = false;
      state.quickViewProduct = null;
      state.isMobileMenuOpen = false;
      state.isSearchOpen = false;
    },
  },
});

export const {
  // Navigation
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
  
  // Modals
  toggleLoginModal,
  closeLoginModal,
  toggleCartModal,
  closeCartModal,
  toggleSearchModal,
  openSearchModal,
  closeSearchModal,
  openQuickView,
  closeQuickView,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Loading
  setPageLoading,
  
  // Screen size
  setScreenSize,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Language
  setLanguage,
  
  // Close all
  closeAllModals,
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;
export const selectIsSearchOpen = (state) => state.ui.isSearchOpen;
export const selectIsLoginModalOpen = (state) => state.ui.isLoginModalOpen;
export const selectIsCartModalOpen = (state) => state.ui.isCartModalOpen;
export const selectIsQuickViewOpen = (state) => state.ui.isQuickViewOpen;
export const selectQuickViewProduct = (state) => state.ui.quickViewProduct;
export const selectNotifications = (state) => state.ui.notifications;
export const selectPageLoading = (state) => state.ui.pageLoading;
export const selectScreenSize = (state) => state.ui.screenSize;
export const selectTheme = (state) => state.ui.theme;
export const selectLanguage = (state) => state.ui.language;

export default uiSlice.reducer;
