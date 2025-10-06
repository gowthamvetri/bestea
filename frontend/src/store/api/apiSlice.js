import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token or logout
    api.dispatch({ type: 'auth/logout' });
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'User', 'Order', 'Review', 'Category', 'Cart', 'Wishlist'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query({
      query: ({ page = 1, limit = 12, category, sort, search } = {}) => ({
        url: '/products',
        params: { page, limit, category, sort, search },
      }),
      providesTags: ['Product'],
      // Keep unused data for 60 seconds
      keepUnusedDataFor: 60,
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      keepUnusedDataFor: 300, // Keep product details longer
    }),

    getBestSellers: builder.query({
      query: () => '/products/bestsellers',
      providesTags: ['Product'],
      keepUnusedDataFor: 300,
    }),

    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
      providesTags: ['Product'],
      keepUnusedDataFor: 300,
    }),

    searchProducts: builder.query({
      query: (searchTerm) => ({
        url: '/products/search',
        params: { q: searchTerm },
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),

    // Categories
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
      keepUnusedDataFor: 600, // Categories change rarely
    }),

    // Reviews
    getProductReviews: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Review', id: productId }
      ],
    }),

    getFeaturedTestimonials: builder.query({
      query: () => '/reviews/featured-testimonials',
      providesTags: ['Review'],
      keepUnusedDataFor: 300,
    }),

    createReview: builder.mutation({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // User Orders
    getUserOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // User Profile
    getUserProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetBestSellersQuery,
  useGetFeaturedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  
  // Categories
  useGetCategoriesQuery,
  
  // Reviews
  useGetProductReviewsQuery,
  useGetFeaturedTestimonialsQuery,
  useCreateReviewMutation,
  
  // Orders
  useGetUserOrdersQuery,
  useCreateOrderMutation,
  
  // User
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = apiSlice;
