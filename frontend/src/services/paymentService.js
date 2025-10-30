import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Get available payment methods
 * @returns {Promise<Array>}
 */
export const getPaymentMethods = async () => {
  try {
    const response = await axios.get(`${API_URL}/payment/methods`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

/**
 * Create Razorpay order
 * @param {number} amount - Amount in INR
 * @param {string} receipt - Receipt ID
 * @returns {Promise<Object>}
 */
export const createRazorpayOrder = async (amount, receipt = null) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/payment/create-razorpay-order`,
      {
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise<Object>}
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/payment/verify-razorpay`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

/**
 * Initialize Razorpay payment
 * @param {Object} orderData - Order data from backend
 * @param {Object} options - Additional options
 * @returns {Promise<Object>}
 */
export const initiateRazorpayPayment = async (orderData, options = {}) => {
  // Load Razorpay script
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const {
      name = 'BESTEA',
      description = 'Premium Tea Purchase',
      image = '/logo.png',
      prefill = {},
      theme = { color: '#10b981' },
      onSuccess,
      onFailure
    } = options;

    const razorpayOptions = {
      key: orderData.key, // Razorpay key_id from backend
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency || 'INR',
      name,
      description,
      image,
      order_id: orderData.orderId,
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };

          const verificationResult = await verifyRazorpayPayment(verificationData);
          
          if (onSuccess) {
            onSuccess(verificationResult);
          }
          
          resolve({
            success: true,
            data: verificationResult
          });
        } catch (error) {
          if (onFailure) {
            onFailure(error);
          }
          reject(error);
        }
      },
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || ''
      },
      notes: {
        address: prefill.address || ''
      },
      theme,
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    
    razorpay.on('payment.failed', function (response) {
      const error = {
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        metadata: response.error.metadata
      };
      
      if (onFailure) {
        onFailure(error);
      }
      
      reject(error);
    });

    razorpay.open();
  });
};

/**
 * Process payment based on selected method
 * @param {string} method - Payment method (razorpay, cod)
 * @param {Object} orderDetails - Order details
 * @param {Object} userDetails - User details for prefill
 * @returns {Promise<Object>}
 */
export const processPayment = async (method, orderDetails, userDetails = {}) => {
  if (method === 'razorpay') {
    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      orderDetails.total,
      orderDetails.orderId
    );

    // Initiate payment
    const result = await initiateRazorpayPayment(razorpayOrder, {
      name: 'BESTEA - Premium Tea Store',
      description: `Order #${orderDetails.orderId || 'NEW'}`,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
        address: userDetails.address
      }
    });

    return result;
  } else if (method === 'cod') {
    // For COD, just return success
    return {
      success: true,
      data: {
        method: 'cod',
        status: 'pending'
      }
    };
  } else {
    throw new Error('Unsupported payment method');
  }
};

export default {
  loadRazorpayScript,
  getPaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment,
  initiateRazorpayPayment,
  processPayment
};
