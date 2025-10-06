import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaHeart,
  FaTruck,
  FaLock,
  FaGift,
  FaArrowRight
} from 'react-icons/fa';

// Store actions
import { 
  updateQuantity, 
  removeFromCart, 
  clearCart,
  applyCoupon,
  removeCoupon,
  calculateTotals
} from '../store/slices/cartSlice';

// Services
import { validateCoupon } from '../services/couponService';
import { toast } from 'react-hot-toast';

// Wishlist actions
import { addToWishlist } from '../store/slices/wishlistSlice';

// Image utilities
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

const Cart = () => {
  const dispatch = useDispatch();
  const { 
    items = [], 
    totalAmount = 0, 
    subtotal = 0,
    discount = 0,
    shippingCost = 0,
    tax = 0,
    appliedCoupon = null,
    totalQuantity = 0, 
    isLoading = false 
  } = useSelector(state => state.cart || {});
  
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Ensure we always have a valid cart count for the title
  const cartItemCount = Array.isArray(items) ? items.length : 0;
  
  // Safe title string for Helmet
  const pageTitle = `Shopping Cart (${cartItemCount} items) - BESTEA`;

  // Initialize cart and calculate totals on mount
  useEffect(() => {
    dispatch(calculateTotals());
  }, [dispatch]);

  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const coupon = await validateCoupon(couponCode.trim(), subtotal);
      dispatch(applyCoupon(coupon));
      toast.success(`Coupon "${coupon.code}" applied successfully!`);
      setCouponCode('');
      setShowCouponInput(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed successfully');
  };

  const handleAddToWishlist = (item) => {
    // Add to wishlist without removing from cart
    const wishlistItem = {
      _id: item.productId,
      id: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
    };
    
    dispatch(addToWishlist(wishlistItem));
    toast.success('Item added to wishlist');
  };

  const handleMoveToWishlist = (item) => {
    // Add to wishlist and remove from cart
    const wishlistItem = {
      _id: item.productId,
      id: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
    };
    
    dispatch(addToWishlist(wishlistItem));
    // Remove from cart
    dispatch(removeFromCart(item.id));
    toast.success('Item moved to wishlist');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setShowClearConfirm(false);
    toast.success('Cart cleared successfully');
  };

  // Calculate final total (totalAmount already includes everything from the store)
  const finalTotal = totalAmount;

  if (cartItemCount === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - BESTEA</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-20">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-4xl text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any tea to your cart yet. 
                Explore our premium collection and find your perfect blend.
              </p>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y">
                  <AnimatePresence>
                    {items?.map((item, index) => {
                      // Create a robust unique key
                      const itemId = item._id || item.id || `item-${index}`;
                      const variantKey = item.variant?.size || item.variant?.name || item.variantId || 'default';
                      const uniqueKey = `${itemId}-${variantKey}`;
                      
                      return (
                        <motion.div
                          key={uniqueKey}
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-24 h-24 flex-shrink-0">
                            <img
                              src={getProductImageSrc(item)}
                              alt={item.name}
                              onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                  {item.name}
                                </h3>
                                {item.variant && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    Size: {item.variant.size} ({item.variant.weight})
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold text-gray-900">
                                    ₹{item.price}
                                  </span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-400 line-through">
                                      ₹{item.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => handleQuantityUpdate(
                                      item.id, 
                                      item.quantity - 1
                                    )}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <FaMinus className="text-sm text-gray-600" />
                                  </button>
                                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityUpdate(
                                      item.id, 
                                      item.quantity + 1
                                    )}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                    disabled={item.quantity >= (item.stock || 99)}
                                  >
                                    <FaPlus className="text-sm text-gray-600" />
                                  </button>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-gray-900">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </div>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <div className="text-sm text-gray-400 line-through">
                                      ₹{(item.originalPrice * item.quantity).toLocaleString()}
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove from cart"
                                  >
                                    <FaTrash className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => handleAddToWishlist(item)}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Add to wishlist"
                                  >
                                    <FaHeart className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link 
                  to="/shop" 
                  className="inline-flex items-center text-primary-400 hover:text-primary-500 font-medium"
                >
                  <FaArrowRight className="mr-2 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-8">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {/* Coupon Section */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          Coupon Applied: {appliedCoupon.code}
                        </div>
                        <div className="text-sm text-green-600">
                          -{appliedCoupon.type === 'percentage' 
                            ? `${appliedCoupon.value}%` 
                            : `₹${appliedCoupon.value}`
                          }
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      {!showCouponInput ? (
                        <button
                          onClick={() => setShowCouponInput(true)}
                          className="flex items-center gap-2 text-primary-400 hover:text-primary-500 text-sm font-medium"
                        >
                          <FaGift />
                          Apply Coupon
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || couponLoading}
                              className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {couponLoading ? 'Applying...' : 'Apply'}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setShowCouponInput(false);
                              setCouponCode('');
                            }}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>

                  {/* Free Shipping Progress */}
                  {subtotal < 499 && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm text-yellow-800 mb-2">
                        Add ₹{(499 - subtotal).toLocaleString()} more for FREE shipping!
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link to="/checkout" className="btn btn-primary btn-lg w-full">
                    <FaLock className="mr-2" />
                    Proceed to Checkout
                  </Link>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                    <FaTruck className="text-primary-400" />
                    <span>Secure checkout with 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>

              {/* Recommended Products */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">You May Also Like</h3>
                </div>
                <div className="p-6">
                  <div className="text-center text-gray-600">
                    Recommended products will appear here
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Cart?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;