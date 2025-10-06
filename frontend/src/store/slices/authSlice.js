import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function to get initial auth state
const getInitialAuthState = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // If both token and user data exist, try to restore the session
  if (token && userData) {
    try {
      // Check if token is not expired
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp > currentTime) {
          // Token is valid, restore user data
          const user = JSON.parse(userData);
          return {
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          };
        }
      }
    } catch (error) {
      // If there's any error, clear the stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  // Default state
  return {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

// Initial state
const initialState = getInitialAuthState();

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      // Remove invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      );
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.post(`${API_URL}/auth/verify-token`);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue('Token verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset email'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Initialize auth from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token) {
        // Check if token is expired
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            // If token is not expired
            if (payload.exp > currentTime) {
              state.token = token;
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // If user data is also stored, restore it
              if (user) {
                try {
                  state.user = JSON.parse(user);
                  state.isAuthenticated = true;
                } catch (error) {
                  // Invalid user data, remove it
                  localStorage.removeItem('user');
                }
              }
            } else {
              // Token is expired, clear everything
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              delete axios.defaults.headers.common['Authorization'];
            }
          } else {
            // Invalid token format
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Error parsing token, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    },
    // Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Verify token
      .addCase(verifyToken.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setLoading, initializeAuth, updateUserProfile } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
