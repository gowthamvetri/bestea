// Avatar utility functions
export const DEFAULT_AVATAR_URL = '/images/default-avatar.svg';

/**
 * Get a safe avatar URL with fallback
 * @param {Object} user - User object 
 * @param {string} fallback - Fallback URL (optional)
 * @returns {string} Safe avatar URL
 */
export const getAvatarUrl = (user, fallback = DEFAULT_AVATAR_URL) => {
  if (!user) return fallback;
  
  // Handle different avatar formats
  if (user.avatar) {
    // If avatar is an object with url property
    if (typeof user.avatar === 'object' && user.avatar.url) {
      return user.avatar.url;
    }
    // If avatar is a direct URL string
    if (typeof user.avatar === 'string') {
      return user.avatar;
    }
  }
  
  return fallback;
};

/**
 * Handle avatar image errors by setting fallback
 * @param {Event} event - Image error event
 */
export const handleAvatarError = (event) => {
  if (event.target.src !== DEFAULT_AVATAR_URL) {
    event.target.src = DEFAULT_AVATAR_URL;
  }
};
