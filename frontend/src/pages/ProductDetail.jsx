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
  FaArrowLeft
} from 'react-icons/fa';

// Store actions
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
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
  const { user } = useSelector(state => state.auth);
  const { currentProduct, isLoading, error } = useSelector(state => state.products);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

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

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(currentProduct._id || currentProduct.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(currentProduct));
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
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
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
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = currentProduct.images?.[selectedImageIndex] || currentProduct.mainImage;

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-orange-600">Home</Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              <Link to="/shop" className="text-gray-500 hover:text-orange-600">Shop</Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">{currentProduct.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Detail */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              {/* Main Image */}
              <div className="relative mb-4">
                <img
                  src={
                    currentProduct.images?.[selectedImageIndex]?.url || 
                    currentProduct.mainImage?.url || 
                    currentProduct.image || 
                    '/images/tea-placeholder.svg'
                  }
                  alt={currentProduct.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
                {currentProduct.badges?.includes('15% OFF') && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                      {Math.round(((currentProduct.defaultOriginalPrice || currentProduct.originalPrice) - (currentProduct.defaultPrice || currentProduct.price)) / (currentProduct.defaultOriginalPrice || currentProduct.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                {currentProduct.isBestseller && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium">
                      Best Seller
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {currentProduct.images && currentProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {currentProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url || image}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Red Banner - matching Tata Tea */}
              <div className="bg-red-600 text-white text-center py-2 mb-6 rounded">
                <span className="text-sm font-medium">FREE SHIPPING ON ALL ORDERS ABOVE ₹500</span>
              </div>

              {/* Product Title and Rating */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(currentProduct.averageRating || currentProduct.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">({currentProduct.averageRating || currentProduct.rating || 4.8}) • {currentProduct.totalReviews || 0} Reviews</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{currentProduct.variants?.find(v => v.name === selectedVariant)?.price || currentProduct.defaultPrice || currentProduct.price}
                  </span>
                  {(currentProduct.variants?.find(v => v.name === selectedVariant)?.originalPrice || currentProduct.defaultOriginalPrice || currentProduct.originalPrice) && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{currentProduct.variants?.find(v => v.name === selectedVariant)?.originalPrice || currentProduct.defaultOriginalPrice || currentProduct.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Tea Type Badge */}
              <div className="mb-6">
                <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  {currentProduct.category === 'black' ? 'Black Tea' : 
                   currentProduct.category === 'green' ? 'Green Tea' :
                   currentProduct.category === 'white' ? 'White Tea' :
                   currentProduct.category === 'herbal' ? 'Herbal Tea' :
                   currentProduct.blendType || 'Tea'}
                </span>
                <span className="ml-3 text-gray-600">
                  {currentProduct.shortDescription || currentProduct.description}
                </span>
              </div>

              {/* Variant Selection */}
              {currentProduct.variants && currentProduct.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Variant:</h3>
                  <div className="space-y-2">
                    {currentProduct.variants.map((variant, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="variant"
                          value={variant.name}
                          checked={selectedVariant === variant.name}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">
                          {variant.name} - ₹{variant.price}
                          {variant.stock <= 5 && variant.stock > 0 && (
                            <span className="text-orange-600 text-sm ml-2">Only {variant.stock} left!</span>
                          )}
                          {variant.stock === 0 && (
                            <span className="text-red-600 text-sm ml-2">Out of stock</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="mb-8">
                {!isInCart ? (
                  // Show quantity selector and Add to Cart button when not in cart
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaShoppingCart className="w-5 h-5" />
                      Add to cart
                    </button>
                  </>
                ) : (
                  // Show increment/decrement controls when already in cart
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Cart:</span>
                    <div className="flex items-center border border-orange-300 rounded-lg bg-orange-50">
                      <button
                        onClick={handleDecrementCart}
                        className="px-4 py-2 hover:bg-orange-100 text-orange-600 transition-colors"
                        title={cartQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                      >
                        <FaMinus className="w-4 h-4" />
                      </button>
                      <span className="px-6 py-2 border-x border-orange-300 font-medium text-orange-700">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={handleIncrementCart}
                        className="px-4 py-2 hover:bg-orange-100 text-orange-600 transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ All ingredients are sustainable and ethically sourced with quality and freshness</p>
                <p>✓ Best to store in a re-sealable pouch to maintain quality and freshness</p>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['ingredients', 'origin', 'freshness'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {activeTab === 'ingredients' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tea</h3>
                  <p className="text-gray-700">{currentProduct.ingredients}</p>
                </div>
              )}
              {activeTab === 'origin' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Origin</h3>
                  <p className="text-gray-700">{currentProduct.origin}</p>
                </div>
              )}
              {activeTab === 'freshness' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Freshness</h3>
                  <p className="text-gray-700">{currentProduct.freshness}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendation Cards */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-100 p-6 rounded-lg text-center">
                <h4 className="font-bold text-gray-900 mb-2">Best Served As:</h4>
                <p className="text-gray-700">Hot drink</p>
              </div>
              <div className="bg-orange-100 p-6 rounded-lg text-center">
                <h4 className="font-bold text-gray-900 mb-2">Time of the Day:</h4>
                <p className="text-gray-700">Morning & Afternoon</p>
              </div>
              <div className="bg-orange-100 p-6 rounded-lg text-center">
                <h4 className="font-bold text-gray-900 mb-2">Recommended Consumption:</h4>
                <p className="text-gray-700">One to Many Times</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
