/**
 * Request Manager Utility
 * Prevents duplicate API requests by tracking pending requests and caching results
 */

const pendingRequests = new Map();
const requestTimestamps = new Map();
const responseCache = new Map();
const MIN_REQUEST_INTERVAL = 500; // Minimum 500ms between same requests
const CACHE_DURATION = 30 * 1000; // Cache for 30 seconds

/**
 * Check if a request is currently pending
 * @param {string} key - Unique key for the request
 * @returns {boolean}
 */
export const isRequestPending = (key) => {
  return pendingRequests.has(key);
};

/**
 * Check if enough time has passed since last request
 * @param {string} key - Unique key for the request
 * @returns {boolean}
 */
export const canMakeRequest = (key) => {
  const lastTimestamp = requestTimestamps.get(key);
  if (!lastTimestamp) return true;
  
  return Date.now() - lastTimestamp >= MIN_REQUEST_INTERVAL;
};

/**
 * Mark a request as pending
 * @param {string} key - Unique key for the request
 * @param {Promise} promise - The request promise
 * @returns {Promise}
 */
export const trackRequest = (key, promise) => {
  // If request is already pending, return the existing promise
  if (pendingRequests.has(key)) {
    console.log(`Request ${key} already pending, reusing...`);
    return pendingRequests.get(key);
  }

  // If not enough time has passed, reject immediately
  if (!canMakeRequest(key)) {
    console.log(`Request ${key} throttled`);
    return Promise.reject(new Error('Request throttled - please wait'));
  }

  // Track the new request
  requestTimestamps.set(key, Date.now());
  pendingRequests.set(key, promise);

  // Clean up when done
  promise
    .finally(() => {
      pendingRequests.delete(key);
    });

  return promise;
};

/**
 * Clear a specific request tracking
 * @param {string} key - Unique key for the request
 */
export const clearRequest = (key) => {
  pendingRequests.delete(key);
  requestTimestamps.delete(key);
};

/**
 * Clear all tracked requests
 */
export const clearAllRequests = () => {
  pendingRequests.clear();
  requestTimestamps.clear();
};

/**
 * Get cached response if available and not expired
 * @param {string} key - Unique key for the request
 * @returns {any|null} - Cached response or null
 */
export const getCachedResponse = (key) => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Cache expired, remove it
  responseCache.delete(key);
  return null;
};

/**
 * Set cached response
 * @param {string} key - Unique key for the request
 * @param {any} data - Response data to cache
 */
export const setCachedResponse = (key, data) => {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Wrapper for API requests with deduplication and caching
 * @param {string} key - Unique key for the request
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} options - Options for caching and throttling
 * @returns {Promise}
 */
export const managedRequest = async (key, requestFn, options = {}) => {
  const { useCache = true, cacheDuration = CACHE_DURATION } = options;
  
  // Check cache first
  if (useCache) {
    const cached = getCachedResponse(key);
    if (cached) {
      console.log(`✓ Using cached response for ${key}`);
      return Promise.resolve(cached);
    }
  }
  
  // Check if request is pending
  if (pendingRequests.has(key)) {
    console.log(`⏳ Request ${key} already pending, reusing promise...`);
    return pendingRequests.get(key);
  }
  
  // Check throttling
  const lastTimestamp = requestTimestamps.get(key);
  if (lastTimestamp) {
    const timeSinceLastRequest = Date.now() - lastTimestamp;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Request ${key} throttled, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Create and track the request
  requestTimestamps.set(key, Date.now());
  const promise = requestFn()
    .then(response => {
      // Cache successful response
      if (useCache) {
        setCachedResponse(key, response);
      }
      console.log(`✓ Request ${key} completed successfully`);
      return response;
    })
    .catch(error => {
      // Handle 429 errors specially
      if (error.response?.status === 429) {
        console.error(`🚫 Rate limit hit for ${key}, caching error`);
        // Wait longer before allowing retry
        requestTimestamps.set(key, Date.now() + 5000); // Add 5 second penalty
      }
      throw error;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });
  
  pendingRequests.set(key, promise);
  return promise;
};
