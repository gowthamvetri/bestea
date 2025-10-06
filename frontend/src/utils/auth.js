import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Token management
export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

// User management
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

// Token validation
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return token && !isTokenExpired(token);
};

// Axios interceptors setup
export const setupAxiosInterceptors = (store) => {
  // Request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        removeToken();
        removeUser();
        
        // Dispatch logout action if store is available
        if (store && store.dispatch) {
          store.dispatch({ type: 'auth/logout' });
        }
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );
};

// API service functions
export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },

  refreshToken: async () => {
    const response = await axios.post(`${API_URL}/auth/refresh`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password
    });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
    return response.data;
  }
};

// Role-based access control
export const hasRole = (user, role) => {
  return user && user.role === role;
};

export const hasPermission = (user, permission) => {
  return user && user.permissions && user.permissions.includes(permission);
};

export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

export const isModerator = (user) => {
  return hasRole(user, 'moderator') || isAdmin(user);
};

// Local storage helpers
export const clearAuthData = () => {
  removeToken();
  removeUser();
};

export const setAuthData = (token, user) => {
  setToken(token);
  setUser(user);
};

// Default export for convenience
const auth = {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isTokenExpired,
  isAuthenticated,
  setupAxiosInterceptors,
  authAPI,
  hasRole,
  hasPermission,
  isAdmin,
  isModerator,
  clearAuthData,
  setAuthData
};

export default auth;
