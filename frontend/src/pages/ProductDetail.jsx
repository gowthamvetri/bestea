import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaStar, 
  FaHeart, 
  FaShareAlt, 
  FaShoppingCart, 
  FaMinus, 
  FaPlus,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaLeaf,
  FaChevronLeft,
  FaChevronRight,
  FaExpandArrowsAlt,
  FaRegHeart,
  FaCheck,
  FaGift,
  FaCertificate,
  FaUsers,
  FaThumbsUp,
  FaBox,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaTimes,
  FaArrowLeft,
  FaFire,
  FaClock,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaTag,
  FaAward,
  FaRegClock
} from 'react-icons/fa';

// Store actions
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addToWishlistAPI, removeFromWishlistAPI } from '../store/slices/wishlistSlice';
import { fetchProductById, fetchProductBySlug } from '../store/slices/productSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

// Utils
import { getProductImageSrc, handleImageError } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { items: cartItems } = useSelector(state => state.cart);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { currentProduct, isLoading, error } = useSelector(state => state.products);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [isPinCodeValid, setIsPinCodeValid] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Check if current product with selected variant is already in cart
  const cartItem = cartItems.find(item => {
    const productMatch = item.productId === (currentProduct?._id || currentProduct?.id);
    const variantMatch = !selectedVariant || item.variant?.name === selectedVariant;
    return productMatch && variantMatch;
  });
  
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isInWishlist = wishlistItems.some(item => item._id === currentProduct?._id || item.id === currentProduct?.id);

  // Fetch product data on mount
  useEffect(() => {
    if (id) {
      // Check if the id is a MongoDB ObjectId (24 characters, hexadecimal)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isObjectId) {
        dispatch(fetchProductById(id));
      } else {
        dispatch(fetchProductBySlug(id));
      }
    }
  }, [dispatch, id]);

  // Set default variant when product loads
  useEffect(() => {
    if (currentProduct?.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(currentProduct.variants[0].name);
    }
  }, [currentProduct, selectedVariant]);

  const handleAddToCart = () => {
    if (!currentProduct || (!currentProduct._id && !currentProduct.id)) {
      toast.error('Invalid product data');
      return;
    }
    
    const selectedVar = currentProduct.variants?.find(v => v.name === selectedVariant);
    
    const cartItem = {
      product: {
        _id: currentProduct._id || currentProduct.id,
        name: currentProduct.name,
        slug: currentProduct.slug,
        mainImage: currentProduct.mainImage,
        images: currentProduct.images,
        defaultPrice: currentProduct.defaultPrice,
        price: currentProduct.price,
        defaultOriginalPrice: currentProduct.defaultOriginalPrice,
        originalPrice: currentProduct.originalPrice,
        stock: currentProduct.stock,
        variants: currentProduct.variants
      },
      variant: selectedVar || (selectedVariant ? { name: selectedVariant } : null),
      quantity
    };
    
    dispatch(addToCart(cartItem));
    toast.success(`${currentProduct.name} added to cart!`);
  };

  const handleIncrementCart = () => {
    if (cartItem) {
      dispatch(updateQuantity({ itemId: cartItem.id, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecrementCart = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        dispatch(removeFromCart(cartItem.id));
        toast.success('Item removed from cart');
      } else {
        dispatch(updateQuantity({ itemId: cartItem.id, quantity: cartItem.quantity - 1 }));
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    if (isInWishlist) {
      // Use API if authenticated, localStorage if not
      if (isAuthenticated) {
        await dispatch(removeFromWishlistAPI(currentProduct._id || currentProduct.id));
      } else {
        dispatch(removeFromWishlist(currentProduct._id || currentProduct.id));
      }
      toast.success('Removed from wishlist');
    } else {
      // Use API if authenticated, localStorage if not
      if (isAuthenticated) {
        await dispatch(addToWishlistAPI(currentProduct));
      } else {
        dispatch(addToWishlist(currentProduct));
      }
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          text: currentProduct?.shortDescription || currentProduct?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleCheckPinCode = () => {
    if (pinCode.length === 6) {
      // Simulate pin code check
      const validPinCodes = ['560001', '560002', '110001', '400001', '600001'];
      const isValid = validPinCodes.includes(pinCode) || Math.random() > 0.3;
      setIsPinCodeValid(isValid);
      if (isValid) {
        toast.success('Delivery available in your area!');
      } else {
        toast.error('Delivery not available in this area');
      }
    } else {
      toast.error('Please enter a valid 6-digit pin code');
    }
  };

  const nextImage = () => {
    if (currentProduct?.images?.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === currentProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (currentProduct?.images?.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? currentProduct.images.length - 1 : prev - 1
      );
    }
  };

  const tabs = [
    { id: 'description', label: 'Description', icon: FaBox },
    { id: 'ingredients', label: 'Ingredients', icon: FaLeaf },
    { id: 'reviews', label: 'Reviews', icon: FaUsers },
    { id: 'shipping', label: 'Shipping', icon: FaTruck }
  ];

  // Show loading spinner while fetching product
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

    if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link
            to="/shop"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = currentProduct.images?.[selectedImageIndex] || currentProduct.mainImage;

  // Calculate discount percentage
  const discountPercent = currentProduct.defaultOriginalPrice 
    ? Math.round(((currentProduct.defaultOriginalPrice - currentProduct.defaultPrice) / currentProduct.defaultOriginalPrice) * 100)
    : 0;

  // Get stock status
  const getStockStatus = () => {
    const stock = currentProduct.stock || 0;
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', available: false };
    if (stock <= 5) return { text: `Only ${stock} left in stock`, color: 'text-orange-600', available: true };
    return { text: 'In Stock', color: 'text-green-600', available: true };
  };

  const stockStatus = getStockStatus();

  return (
    <>
      <Helmet>
        <title>{currentProduct.name} | Bestea</title>
        <meta name="description" content={currentProduct.shortDescription || currentProduct.description} />
        <meta property="og:title" content={currentProduct.name} />
        <meta property="og:description" content={currentProduct.shortDescription || currentProduct.description} />
        <meta property="og:image" content={getProductImageSrc(currentImage)} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-green-600 transition-colors">Home</Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              <Link to="/shop" className="text-gray-500 hover:text-green-600 transition-colors">Shop</Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              {currentProduct.category && (
                <>
                  <span className="text-gray-500 capitalize">
                    {typeof currentProduct.category === 'object' 
                      ? currentProduct.category.name 
                      : currentProduct.category}
                  </span>
                  <FaChevronRight className="w-3 h-3 text-gray-400" />
                </>
              )}
              <span className="text-gray-900 font-medium truncate">{currentProduct.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column - Images */}
            <div className="lg:col-span-5">
              <div className="sticky top-4">
                {/* Main Image */}
                <div className="relative mb-4 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <div className="relative aspect-square">
                    <img
                      src={
                        currentProduct.images?.[selectedImageIndex]?.url || 
                        currentProduct.mainImage?.url || 
                        currentProduct.image || 
                        '/images/tea-placeholder.svg'
                      }
                      alt={currentProduct.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discountPercent > 0 && (
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-lg">
                          {discountPercent}% OFF
                        </span>
                      )}
                      {currentProduct.isBestseller && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-lg flex items-center gap-1">
                          <FaFire className="w-3 h-3" />
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Wishlist & Share Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleWishlistToggle}
                        className="p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {isInWishlist ? (
                          <FaHeart className="w-5 h-5 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-5 h-5 text-gray-600" />
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <FaShareAlt className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>

                    {/* Image Navigation */}
                    {currentProduct.images && currentProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <FaChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <FaChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {currentProduct.images && currentProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {currentProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-green-600 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.url || image}
                          alt={`${currentProduct.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons for Desktop */}
                <div className="hidden lg:grid grid-cols-2 gap-3 mt-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaPhoneAlt className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Contact Seller</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FaQuestionCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Ask Question</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:col-span-7">
              
              {/* Product Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {currentProduct.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md">
                  <span className="font-bold">{currentProduct.averageRating || currentProduct.rating || 4.8}</span>
                  <FaStar className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">{currentProduct.totalReviews || 0} Ratings</span>
                  <span className="text-gray-400">•</span>
                  <span>{currentProduct.totalReviews || 0} Reviews</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    ₹{currentProduct.variants?.find(v => v.name === selectedVariant)?.price || currentProduct.defaultPrice || currentProduct.price}
                  </span>
                  {(currentProduct.variants?.find(v => v.name === selectedVariant)?.originalPrice || currentProduct.defaultOriginalPrice || currentProduct.originalPrice) && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{currentProduct.variants?.find(v => v.name === selectedVariant)?.originalPrice || currentProduct.defaultOriginalPrice || currentProduct.originalPrice}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>


              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-semibold ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>

              {/* Variant Selection */}
              {currentProduct.variants && currentProduct.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Select Variant:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentProduct.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant.name)}
                        disabled={variant.stock === 0}
                        className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                          selectedVariant === variant.name
                            ? 'border-green-600 bg-green-50'
                            : variant.stock === 0
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{variant.name}</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">₹{variant.price}</div>
                        {variant.stock <= 5 && variant.stock > 0 && (
                          <div className="text-xs text-orange-600 mt-1">Only {variant.stock} left</div>
                        )}
                        {variant.stock === 0 && (
                          <div className="text-xs text-red-600 mt-1">Out of stock</div>
                        )}
                        {selectedVariant === variant.name && (
                          <FaCheck className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Cart Actions */}
              <div className="mb-6">
                {!isInCart ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaMinus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-6 py-2 font-bold text-gray-900 border-x-2 border-gray-300 min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaPlus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        disabled={!stockStatus.available}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <FaShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleAddToCart();
                          navigate('/cart');
                        }}
                        disabled={!stockStatus.available}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <FaFire className="w-5 h-5" />
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border-2 border-green-600 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-green-800">Added to Cart</span>
                      <div className="flex items-center border-2 border-green-600 rounded-lg bg-white">
                        <button
                          onClick={handleDecrementCart}
                          className="px-4 py-2 hover:bg-green-50 text-green-600 transition-colors"
                        >
                          <FaMinus className="w-4 h-4" />
                        </button>
                        <span className="px-6 py-2 font-bold text-green-700 border-x-2 border-green-600 min-w-[60px] text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={handleIncrementCart}
                          className="px-4 py-2 hover:bg-green-50 text-green-600 transition-colors"
                        >
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/cart')}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Go to Cart
                    </button>
                  </div>
                )}
              </div>



              {/* Product Highlights */}
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-4">Product Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3">
                    <FaLeaf className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">100% Natural</div>
                      <div className="text-sm text-gray-600">Organic ingredients</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaShieldAlt className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Quality Assured</div>
                      <div className="text-sm text-gray-600">Lab tested</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaTruck className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Free Delivery</div>
                      <div className="text-sm text-gray-600">Orders above ₹500</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaUndo className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">7 Days Return</div>
                      <div className="text-sm text-gray-600">Easy returns</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaAward className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Certified</div>
                      <div className="text-sm text-gray-600">Premium quality</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaMoneyBillWave className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Secure Payment</div>
                      <div className="text-sm text-gray-600">100% safe</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Sold by</div>
                    <div className="font-bold text-gray-900">Bestea Premium Tea Co.</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                        <span>4.5</span>
                        <FaStar className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-gray-600">Trusted Seller</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors">
                    View Shop
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex">
                  {['description', 'specifications', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 px-6 font-semibold text-sm sm:text-base transition-colors ${
                        activeTab === tab
                          ? 'bg-white text-green-600 border-b-2 border-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab === 'description' && 'Description'}
                      {tab === 'specifications' && 'Specifications'}
                      {tab === 'reviews' && `Reviews (${currentProduct.totalReviews || 0})`}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="prose max-w-none"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About this product</h3>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {currentProduct.description || currentProduct.shortDescription}
                      </p>

                      {currentProduct.ingredients && (
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h4>
                          <p className="text-gray-700">{currentProduct.ingredients}</p>
                        </div>
                      )}

                      {currentProduct.origin && (
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Origin</h4>
                          <p className="text-gray-700">{currentProduct.origin}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-600 rounded-lg">
                              <FaLeaf className="w-5 h-5 text-white" />
                            </div>
                            <h5 className="font-bold text-gray-900">Best Served</h5>
                          </div>
                          <p className="text-gray-700 text-sm">Hot or Cold</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-600 rounded-lg">
                              <FaRegClock className="w-5 h-5 text-white" />
                            </div>
                            <h5 className="font-bold text-gray-900">Best Time</h5>
                          </div>
                          <p className="text-gray-700 text-sm">Morning & Evening</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <FaThumbsUp className="w-5 h-5 text-white" />
                            </div>
                            <h5 className="font-bold text-gray-900">Recommended</h5>
                          </div>
                          <p className="text-gray-700 text-sm">Daily consumption</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'specifications' && (
                    <motion.div
                      key="specifications"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Product Specifications</h3>
                      <div className="divide-y divide-gray-200">
                        <div className="grid grid-cols-2 py-4">
                          <span className="font-medium text-gray-900">Brand</span>
                          <span className="text-gray-700">Bestea Premium Tea Co.</span>
                        </div>
                        <div className="grid grid-cols-2 py-4">
                          <span className="font-medium text-gray-900">Category</span>
                          <span className="text-gray-700 capitalize">
                            {typeof currentProduct.category === 'object' 
                              ? currentProduct.category.name 
                              : currentProduct.category || 'Tea'}
                          </span>
                        </div>
                        {currentProduct.blendType && (
                          <div className="grid grid-cols-2 py-4">
                            <span className="font-medium text-gray-900">Blend Type</span>
                            <span className="text-gray-700">{currentProduct.blendType}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 py-4">
                          <span className="font-medium text-gray-900">Stock Status</span>
                          <span className={stockStatus.color}>{stockStatus.text}</span>
                        </div>
                        <div className="grid grid-cols-2 py-4">
                          <span className="font-medium text-gray-900">Storage</span>
                          <span className="text-gray-700">Store in a cool, dry place</span>
                        </div>
                        <div className="grid grid-cols-2 py-4">
                          <span className="font-medium text-gray-900">Shelf Life</span>
                          <span className="text-gray-700">12 months from manufacturing</span>
                        </div>
                        {currentProduct.origin && (
                          <div className="grid grid-cols-2 py-4">
                            <span className="font-medium text-gray-900">Origin</span>
                            <span className="text-gray-700">{currentProduct.origin}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
                        <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                              {currentProduct.averageRating || currentProduct.rating || 4.8}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={`w-5 h-5 ${
                                    i < Math.floor(currentProduct.averageRating || currentProduct.rating || 4.8)
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">{currentProduct.totalReviews || 0} ratings</div>
                          </div>
                          <div className="flex-1">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const percentage = rating === 5 ? 75 : rating === 4 ? 20 : rating === 3 ? 3 : rating === 2 ? 1 : 1;
                              return (
                                <div key={rating} className="flex items-center gap-3 mb-2">
                                  <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-yellow-400 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-center py-8 text-gray-500">
                        <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No reviews yet. Be the first to review this product!</p>
                        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Write a Review
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Related Products / You May Also Like */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Related products will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
