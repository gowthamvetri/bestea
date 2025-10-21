import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { motion } from 'framer-motion';

const AddToCartButton = ({ 
  product, 
  variant = null,
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  
  // Create unique item identifier
  const itemId = variant ? `${product._id}-${variant.name}` : product._id;
  
  // Check if item is in cart
  const cartItem = cartItems.find(item => item.id === itemId);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // Size configurations
  const sizeClasses = {
    small: {
      container: 'h-8',
      button: 'px-3 py-1.5 text-xs',
      quantityButton: 'w-7 h-7',
      quantityText: 'w-8 text-sm',
      icon: 'text-xs'
    },
    medium: {
      container: 'h-10',
      button: 'px-4 py-2.5 text-sm',
      quantityButton: 'w-8 h-8',
      quantityText: 'w-10 text-base',
      icon: 'text-sm'
    },
    large: {
      container: 'h-12',
      button: 'px-6 py-3 text-base',
      quantityButton: 'w-10 h-10',
      quantityText: 'w-12 text-lg',
      icon: 'text-base'
    }
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.medium;

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cartItemData = {
      product,
      variant,
      quantity: 1
    };
    dispatch(addToCart(cartItemData));
  };

  const handleIncrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentQuantity < (product.stock || 999)) {
      dispatch(updateQuantity({ 
        itemId: itemId, 
        quantity: currentQuantity + 1 
      }));
    }
  };

  const handleDecrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ 
        itemId: itemId, 
        quantity: currentQuantity - 1 
      }));
    } else {
      // Remove from cart if quantity becomes 0
      dispatch(removeFromCart(itemId));
    }
  };

  if (!isInCart) {
    // Show "Add to Cart" button
    return (
      <motion.button
        onClick={handleAddToCart}
        disabled={!product.stock || product.stock === 0}
        className={`w-full ${sizeConfig.button} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${className}`}
        whileHover={{ scale: product.stock ? 1.02 : 1 }}
        whileTap={{ scale: product.stock ? 0.98 : 1 }}
      >
        <FaShoppingCart className={sizeConfig.icon} />
        <span>{product.stock ? 'Add to Cart' : 'Out of Stock'}</span>
      </motion.button>
    );
  }

  // Show quantity selector with "In Cart:" label
  return (
    <div className={`w-full flex items-center justify-between gap-2 bg-green-50 border-2 border-green-500 rounded-xl px-3 ${sizeConfig.container} ${className}`}>
      {/* "In Cart:" Label */}
      <span className="text-green-700 font-semibold text-sm whitespace-nowrap">
        In Cart:
      </span>

      {/* Quantity Controls */}
      <div className="flex items-center gap-0">
        {/* Decrement Button */}
        <motion.button
          onClick={handleDecrement}
          className="w-6 h-6 flex items-center justify-center bg-white hover:bg-green-100 text-green-600 rounded-md transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <FaMinus className="text-xs" />
        </motion.button>

        {/* Quantity Display */}
        <div className="w-10 flex items-center justify-center font-bold text-green-700">
          {currentQuantity}
        </div>

        {/* Increment Button */}
        <motion.button
          onClick={handleIncrement}
          disabled={currentQuantity >= (product.stock || 999)}
          className="w-6 h-6 flex items-center justify-center bg-white hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-green-600 rounded-md transition-colors"
          whileTap={{ scale: currentQuantity < (product.stock || 999) ? 0.9 : 1 }}
        >
          <FaPlus className="text-xs" />
        </motion.button>
      </div>
    </div>
  );
};

export default AddToCartButton;
