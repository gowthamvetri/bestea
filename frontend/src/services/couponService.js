// Available coupons for demo purposes
const AVAILABLE_COUPONS = [
  {
    code: 'BESTEA10',
    type: 'percentage',
    value: 10,
    minOrder: 200,
    description: '10% off on orders above ₹200',
    active: true
  },
  {
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    minOrder: 300,
    description: '₹50 off on orders above ₹300',
    active: true
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 50,
    minOrder: 400,
    description: 'Free shipping on orders above ₹400',
    active: true
  },
  {
    code: 'TEA20',
    type: 'percentage',
    value: 20,
    minOrder: 500,
    description: '20% off on orders above ₹500',
    active: true
  }
];

/**
 * Validate and apply coupon
 * @param {string} couponCode - The coupon code to validate
 * @param {number} orderTotal - The current order total
 * @returns {Promise<Object>} Coupon details or error
 */
export const validateCoupon = async (couponCode, orderTotal) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const coupon = AVAILABLE_COUPONS.find(
        c => c.code.toLowerCase() === couponCode.toLowerCase() && c.active
      );

      if (!coupon) {
        reject(new Error('Invalid coupon code'));
        return;
      }

      if (orderTotal < coupon.minOrder) {
        reject(new Error(`Minimum order amount is ₹${coupon.minOrder} for this coupon`));
        return;
      }

      resolve(coupon);
    }, 500); // Simulate network delay
  });
};

/**
 * Get all available coupons
 * @returns {Array} List of available coupons
 */
export const getAvailableCoupons = () => {
  return AVAILABLE_COUPONS.filter(c => c.active);
};

/**
 * Calculate discount amount
 * @param {Object} coupon - The coupon object
 * @param {number} subtotal - The subtotal amount
 * @returns {number} Discount amount
 */
export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  
  if (coupon.type === 'percentage') {
    return Math.round((subtotal * coupon.value) / 100);
  } else if (coupon.type === 'fixed') {
    return Math.min(coupon.value, subtotal);
  }
  
  return 0;
};
