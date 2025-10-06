const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadProduct, uploadAvatar, deleteImage, extractPublicId } = require('../config/cloudinary');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Upload product image
// @route   POST /api/upload/product
// @access  Private (Admin only)
router.post('/product', auth, authorize('admin'), uploadProduct.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading product image',
      error: error.message
    });
  }
});

// @desc    Upload multiple product images
// @route   POST /api/upload/product/multiple
// @access  Private (Admin only)
router.post('/product/multiple', auth, authorize('admin'), uploadProduct.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} product images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Multiple product images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading product images',
      error: error.message
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    
    // Delete old avatar if exists
    if (user.avatar && user.avatar.publicId) {
      try {
        await deleteImage(user.avatar.publicId);
      } catch (deleteError) {
        console.warn('Warning: Could not delete old avatar:', deleteError.message);
      }
    }

    // Update user with new avatar
    user.avatar = {
      url: req.file.path,
      publicId: req.file.filename
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
});

// @desc    Delete image
// @route   DELETE /api/upload/delete/:publicId
// @access  Private (Admin only)
router.delete('/delete/:publicId', auth, authorize('admin'), async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteImage(decodedPublicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB for products and 2MB for avatars.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed for products.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files (jpg, jpeg, png, webp) are allowed.'
    });
  }

  res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
});

module.exports = router;
