import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUser, FaThumbsUp, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ProductReviews = ({ productId, reviews = [], onAddReview, isAuthenticated, user }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Count ratings by star
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddReview({
        productId,
        rating,
        comment: comment.trim(),
        title: title.trim()
      });

      // Reset form
      setRating(0);
      setComment('');
      setTitle('');
      setShowReviewForm(false);
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-6 h-6 ${i < Math.floor(averageRating) ? 'text-amber-400' : 'text-gray-300'}`}
                  fill="currentColor"
                />
              ))}
            </div>
            <div className="text-gray-600 text-sm">Based on {reviews.length} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{star}</span>
                  <FaStar className="w-3 h-3 text-amber-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </motion.button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-4"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4">Write Your Review</h4>

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <FaStar
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                maxLength={100}
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {comment.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <FaStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No reviews yet</p>
            <p className="text-gray-500 text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.user?.name?.[0]?.toUpperCase() || <FaUser />}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {review.user?.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <FaCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              {/* Review Comment */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Review Footer */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
                  <FaThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpfulCount || 0})</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductReviews);
