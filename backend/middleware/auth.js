const jwt = require('jsonwebtoken');

// Mock user for development when MongoDB is not available
const mockUser = {
  _id: '64a1b2c3d4e5f6789012345b',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  isActive: true,
  isAdmin: true
};

const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      let user;
      
      try {
        // Try to get user from database
        const User = require('../models/User');
        user = await User.findById(decoded.user.id).select('-password');
        
        if (!user) {
          // If user not found in database, use mock user for development
          console.log('User not found in database, using mock user for development');
          user = mockUser;
        }
      } catch (error) {
        // If database is not available, use mock user
        console.log('Database error, using mock user for authentication:', error.message);
        user = mockUser;
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Account is deactivated.'
        });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      };
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-password');
        
        if (user && user.isActive) {
          req.user = {
            id: user._id,
            role: user.role,
            email: user.email,
            name: user.name
          };
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = { auth, authorize, isAdmin, optionalAuth };
