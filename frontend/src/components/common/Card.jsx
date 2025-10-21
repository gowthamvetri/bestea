import React from 'react';
import { motion } from 'framer-motion';
import AddToCartButton from './AddToCartButton';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  interactive = false,
  elevated = false,
  glass = false,
  gradient = false,
  feature = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base card styles
  let cardClasses = 'card';
  
  // Add variant styles
  if (hover && !interactive) cardClasses += ' card-hover';
  if (interactive) cardClasses += ' card-interactive';
  if (elevated) cardClasses += ' card-elevated';
  if (glass) cardClasses += ' card-glass';
  if (gradient) cardClasses += ' card-gradient';
  if (feature) cardClasses += ' card-feature';
  
  // Add custom classes
  if (className) cardClasses += ` ${className}`;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: {
      y: interactive ? -12 : hover ? -8 : 0,
      scale: interactive ? 1.02 : hover ? 1.01 : 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  const CardWrapper = onClick || interactive ? motion.div : motion.div;

  return (
    <CardWrapper
      className={cardClasses}
      onClick={onClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ cursor: onClick || interactive ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </CardWrapper>
  );
};

// Card Header Component
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

// Card Body Component  
const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

// Card Footer Component
const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

// Stats Card Component for Admin Dashboard
const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  urgent = false,
  color = 'bg-gradient-to-br from-green-400 to-special-500',
  delay = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      className={`card card-hover cursor-pointer p-6 ${urgent ? 'ring-2 ring-red-200 animate-pulse' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 font-inter tracking-wide uppercase">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 font-playfair mb-2">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                trendUp ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{trend} from last month</span>
            </div>
          )}
        </div>
        <motion.div 
          className={`${color} p-4 rounded-2xl shadow-lg ${urgent ? 'animate-pulse' : ''}`}
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            boxShadow: "0 20px 25px -5px rgba(154, 203, 60, 0.4)"
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-7 h-7 text-white drop-shadow-sm" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Product Card Component - Compact & Professional
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  onViewDetails,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: delay * 0.05, 
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Badges - Compact & Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg">
              NEW
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-lg shadow-lg">
              ★
            </span>
          )}
        </div>
        
        {/* Wishlist Button - Top Left */}
        <motion.button
          onClick={onAddToWishlist}
          className="absolute top-2 left-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
        
        <img
          src={product.images?.[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            onClick={onViewDetails}
            className="px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quick View
          </motion.button>
        </div>
      </div>

      {/* Product Info - Compact */}
      <div className="p-4">
        {/* Category Tag - Smaller */}
        <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-semibold uppercase tracking-wider bg-green-50 text-green-700 rounded">
          {product.category?.name || 'Tea'}
        </span>
        
        {/* Product Title - 2 Lines Max */}
        <h3 
          onClick={onViewDetails}
          className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug cursor-pointer hover:text-green-600 transition-colors min-h-[2.5rem]"
        >
          {product.name}
        </h3>
        
        {/* Rating - Compact */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>
        
        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Full Width */}
        <AddToCartButton 
          product={product}
          size="medium"
        />
      </div>
    </motion.div>
  );
};

// Export all components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Stats = StatsCard;
Card.Product = ProductCard;

export default Card;