const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bestea/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
});

// Storage configuration for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bestea/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', quality: 'auto', gravity: 'face' },
      { fetch_format: 'auto' }
    ]
  },
});

// Multer middleware for product images
const uploadProduct = multer({ 
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multer middleware for user avatars
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  
  const urlParts = imageUrl.split('/');
  const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
  
  if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
    const pathAfterVersion = urlParts.slice(versionIndex + 1).join('/');
    return pathAfterVersion.split('.')[0]; // Remove file extension
  }
  
  return null;
};

module.exports = {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  deleteImage,
  extractPublicId
};
