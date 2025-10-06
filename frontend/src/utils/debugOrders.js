// Debug utility to test orders API
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const testOrdersAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Testing orders API...');
    console.log('API URL:', `${API_URL}/orders`);
    console.log('Token:', token.substring(0, 20) + '...');

    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Orders API Response:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success) {
      console.log('✅ Success: true');
      console.log('Orders count:', response.data.data?.orders?.length || 0);
      console.log('Pagination:', response.data.data?.pagination);
    } else {
      console.warn('⚠️ Success: false');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Orders API Error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    return null;
  }
};

// New debug function to test database directly
export const testOrdersDebug = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Testing orders debug API...');
    
    const response = await axios.get(`${API_URL}/orders/debug`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 Debug API Response:', response.data);
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('=== DATABASE DEBUG INFO ===');
      console.log('Current User:', data.currentUser);
      console.log('Total Orders in DB:', data.totalOrders);
      console.log('Distinct Users in Orders:', data.distinctUsers);
      console.log('Sample Orders:', data.sampleOrders);
      
      // Check if current user ID matches any order users
      const currentUserId = data.currentUser.id;
      const matchingOrders = data.sampleOrders.filter(order => 
        order.user.toString() === currentUserId.toString()
      );
      console.log('Orders matching current user:', matchingOrders.length);
      
      if (matchingOrders.length === 0) {
        console.warn('❌ No orders found for current user ID:', currentUserId);
        console.warn('Available user IDs in orders:', data.distinctUsers);
      } else {
        console.log('✅ Found matching orders for current user');
      }
    }

    return response.data;
  } catch (error) {
    console.error('❌ Orders Debug API Error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    return null;
  }
};

// Test authentication
export const testAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Auth Debug:');
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!user);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token valid:', payload.exp * 1000 > Date.now());
    } catch (e) {
      console.error('Invalid token format');
    }
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Invalid user data format');
    }
  }
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  window.testOrdersAPI = testOrdersAPI;
  window.testOrdersDebug = testOrdersDebug;
  window.testAuth = testAuth;
}
