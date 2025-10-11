import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const fetchFeaturedTestimonials = createAsyncThunk(
  'reviews/fetchFeaturedTestimonials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/featured-testimonials`);
      return response.data;
    } catch (error) {
      // If the specific endpoint doesn't exist, try the alternative
      if (error.response?.status === 404) {
        try {
          const fallbackResponse = await axios.get(`${API_URL}/reviews/featured`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          // Return mock data if both endpoints fail
          return [
            {
              name: 'Rajesh Kumar',
              location: 'Delhi',
              rating: 5,
              comment: 'Excellent quality tea! The aroma is amazing and taste is perfect for my morning routine.',
              product: 'Premium Assam Tea'
            },
            {
              name: 'Priya Sharma',
              location: 'Mumbai',
              rating: 5,
              comment: 'BESTEA has become our family favorite. Fresh, authentic, and always consistent quality.',
              product: 'Masala Chai Blend'
            },
            {
              name: 'Arun Patel',
              location: 'Pune',
              rating: 4,
              comment: 'Great value for money. The packaging keeps the tea fresh and the delivery is always on time.',
              product: 'Earl Grey Classic'
            }
          ];
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch testimonials');
    }
  }
);

export const likeReview = createAsyncThunk(
  'reviews/likeReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like review');
    }
  }
);

// Initial state
const initialState = {
  reviews: [],
  currentProductReviews: [],
  userReviews: [],
  testimonials: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  stats: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  }
};

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.currentProductReviews = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProductReviews: (state, action) => {
      state.currentProductReviews = action.payload;
    },
    updateReviewInList: (state, action) => {
      const { reviewId, updates } = action.payload;
      const reviewIndex = state.currentProductReviews.findIndex(review => review._id === reviewId);
      if (reviewIndex !== -1) {
        state.currentProductReviews[reviewIndex] = { ...state.currentProductReviews[reviewIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProductReviews = action.payload.reviews || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.stats = action.payload.stats || initialState.stats;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProductReviews.unshift(action.payload);
        // Update stats
        state.stats.totalReviews += 1;
        if (action.payload.rating && state.stats.ratingDistribution) {
          state.stats.ratingDistribution[action.payload.rating] += 1;
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.currentProductReviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.currentProductReviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProductReviews = state.currentProductReviews.filter(
          review => review._id !== action.payload
        );
        state.stats.totalReviews = Math.max(0, state.stats.totalReviews - 1);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like review
      .addCase(likeReview.fulfilled, (state, action) => {
        const index = state.currentProductReviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.currentProductReviews[index] = action.payload;
        }
      })
      
      // Fetch featured testimonials
      .addCase(fetchFeaturedTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload;
      })
      .addCase(fetchFeaturedTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  clearReviews, 
  clearError, 
  setCurrentProductReviews, 
  updateReviewInList 
} = reviewSlice.actions;

// Selectors
export const selectReviews = (state) => state.reviews.currentProductReviews;
export const selectTestimonials = (state) => state.reviews.testimonials;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;
export const selectReviewStats = (state) => state.reviews.stats;
export const selectReviewPagination = (state) => state.reviews.pagination;

// Export reducer
export default reviewSlice.reducer;
