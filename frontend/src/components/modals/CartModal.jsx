import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageUtils';
import { 
  FaTimes, 
  FaShoppingCart, 
  FaPlus, 
  FaMinus, 
  FaTrash,
  FaArrowRight 
} from 'react-icons/fa';

// Store actions
import { 
  toggleCartModal,
  updateQuantity,
  removeFromCart
} from '../../store/slices/cartSlice';

const CartModal = () => {
  const dispatch = useDispatch();
  const { 
    isCartModalOpen, 
    items, 
    subtotal, 
    total 
  } = useSelector(state => state.cart);

  const handleClose = () => {
    dispatch(toggleCartModal());
  };

  const handleQuantityUpdate = (itemId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ itemId, variantId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId, variantId) => {
    dispatch(removeFromCart({ itemId, variantId }));
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const slideVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
    exit: { x: '100%' }
  };

  return (
    <AnimatePresence>
      {isCartModalOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="ml-auto h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Shopping Cart ({items.length})
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <FaShoppingCart className="text-2xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add some tea to get started
                    </p>
                    <Link
                      to="/shop"
                      onClick={handleClose}
                      className="btn btn-primary"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item._id}-${item.variant?.size || 'default'}`}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={getProductImageSrc(item)}
                            onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-gray-600 mb-2">
                              {item.variant.size} ({item.variant.weight})
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityUpdate(
                                  item._id,
                                  item.variant?.size || null,
                                  item.quantity - 1
                                )}
                                className="w-6 h-6 flex items-center justify-center bg-white border rounded"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityUpdate(
                                  item._id,
                                  item.variant?.size || null,
                                  item.quantity + 1
                                )}
                                className="w-6 h-6 flex items-center justify-center bg-white border rounded"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveItem(
                                item._id,
                                item.variant?.size || null
                              )}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                          
                          <div className="mt-2 text-right">
                            <span className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through ml-2">
                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Subtotal:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to="/cart"
                      onClick={handleClose}
                      className="btn btn-outline w-full"
                    >
                      View Cart
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={handleClose}
                      className="btn btn-primary w-full flex items-center justify-center"
                    >
                      Checkout
                      <FaArrowRight className="ml-2" />
                    </Link>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Free shipping on orders above ₹499
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
