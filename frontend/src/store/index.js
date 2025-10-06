import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import reviewReducer from './slices/reviewSlice';
import { apiSlice } from './api/apiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'wishlist'], // Only persist these slices
  blacklist: ['api'], // Don't persist API cache
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer,
  ui: uiReducer,
  reviews: reviewReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
