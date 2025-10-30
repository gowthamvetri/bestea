import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaCheckCircle, 
  FaBox, 
  FaTruck, 
  FaHome, 
  FaShoppingBag,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaPrint,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch order details
    const fetchOrderDetails = async () => {
      if (!orderId) {
        navigate('/orders');
        return;
      }

      setIsLoading(true);
      try {
        // TODO: Fetch actual order details from API
        // For now, using mock data
        setOrderDetails({
          orderId: orderId,
          orderNumber: `#${orderId.slice(-8).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          total: 1299,
          itemCount: 3,
          paymentMethod: 'Razorpay',
          paymentId: paymentId,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress: {
            name: user?.name || 'Customer',
            address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: user?.phone || '+91 9876543210'
          }
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, paymentId, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Successful - Bestea</title>
        <meta name="description" content="Your order has been placed successfully" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.5,
                  times: [0, 0.3, 0.6, 1]
                }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl mx-auto"
              >
                <FaCheckCircle className="w-16 h-16 text-white" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl">🎉</span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-3"
            >
              Order Placed Successfully!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-gray-600"
            >
              Thank you for your purchase, <span className="font-semibold text-green-600">{user?.name || 'Valued Customer'}</span>!
            </motion.p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm opacity-90 mb-1">Order Number</div>
                  <div className="text-2xl font-bold">{orderDetails?.orderNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90 mb-1">Order Total</div>
                  <div className="text-2xl font-bold">₹{orderDetails?.total?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Date */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Order Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(orderDetails?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="font-semibold text-gray-900">{orderDetails?.paymentMethod}</div>
                    {orderDetails?.paymentId && (
                      <div className="text-xs text-gray-500">ID: {orderDetails.paymentId.slice(-12)}</div>
                    )}
                  </div>
                </div>

                {/* Items Count */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBox className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Items Ordered</div>
                    <div className="font-semibold text-gray-900">{orderDetails?.itemCount} Items</div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaTruck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Estimated Delivery</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(orderDetails?.estimatedDelivery).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t-2 border-gray-100 pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-2">Shipping Address</div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="font-semibold text-gray-900 mb-1">{orderDetails?.shippingAddress?.name}</div>
                      <div className="text-gray-700 text-sm space-y-1">
                        <div>{orderDetails?.shippingAddress?.address}</div>
                        <div>{orderDetails?.shippingAddress?.city}, {orderDetails?.shippingAddress?.state} - {orderDetails?.shippingAddress?.pincode}</div>
                        <div className="flex items-center gap-2 mt-2 text-green-600">
                          <FaPhone className="w-3 h-3" />
                          {orderDetails?.shippingAddress?.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
          >
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaBox className="w-5 h-5" />
              Track Your Order
            </Link>
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-white rounded-2xl border-2 border-gray-100 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaEnvelope className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Check Your Email</div>
                  <div className="text-sm text-gray-600">We've sent an order confirmation email with all the details to {user?.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaTruck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Track Your Package</div>
                  <div className="text-sm text-gray-600">You'll receive tracking updates via email and SMS once your order is shipped</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaWhatsapp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Need Help?</div>
                  <div className="text-sm text-gray-600">Contact us on WhatsApp or call 📞 8000587288 / 9500595929</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Home Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-center mt-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              <FaHome className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
