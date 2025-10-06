import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { uploadService } from '../../services/uploadService';
import ImageUpload from '../common/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

const ProductImageManager = ({ 
  productId,
  existingImages = [], 
  onImagesUpdate,
  maxImages = 5,
  className = ''
}) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [editingAlt, setEditingAlt] = useState(null);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const handleImagesUpload = async (files) => {
    try {
      setError('');
      setUploading(true);

      const response = await uploadService.uploadProductImages(files);
      
      if (response.success) {
        const newImages = response.data.map(img => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.originalName,
          isMain: images.length === 0 // First image becomes main
        }));

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        
        if (onImagesUpdate) {
          onImagesUpdate(updatedImages);
        }
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const imageToRemove = images[index];
      
      if (imageToRemove.publicId) {
        await uploadService.deleteImage(imageToRemove.publicId);
      }

      let updatedImages = images.filter((_, i) => i !== index);
      
      // If we removed the main image, make the first remaining image main
      if (imageToRemove.isMain && updatedImages.length > 0) {
        updatedImages[0].isMain = true;
      }

      setImages(updatedImages);
      
      if (onImagesUpdate) {
        onImagesUpdate(updatedImages);
      }
    } catch (err) {
      setError(`Failed to remove image: ${err.message}`);
    }
  };

  const handleSetMainImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    
    setImages(updatedImages);
    
    if (onImagesUpdate) {
      onImagesUpdate(updatedImages);
    }
  };

  const handleEditAlt = (index) => {
    setEditingAlt(index);
    setAltText(images[index].alt || '');
  };

  const handleSaveAlt = (index) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, alt: altText } : img
    );
    
    setImages(updatedImages);
    setEditingAlt(null);
    
    if (onImagesUpdate) {
      onImagesUpdate(updatedImages);
    }
  };

  const handleCancelAlt = () => {
    setEditingAlt(null);
    setAltText('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
        
        {images.length < maxImages && (
          <ImageUpload
            type="multiple"
            maxFiles={maxImages - images.length}
            maxSize={5}
            onUpload={handleImagesUpload}
            label={`Upload Product Images (${images.length}/${maxImages})`}
            accept="image/*"
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Image Management Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Manage Images</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image.publicId || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Image Display */}
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Main Image Badge */}
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-bestea-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                        <FaStar size={10} />
                        <span>Main</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!image.isMain && (
                        <button
                          onClick={() => handleSetMainImage(index)}
                          className="bg-white text-bestea-600 p-1 rounded shadow hover:bg-bestea-50"
                          title="Set as main image"
                        >
                          <FaStar size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="bg-white text-red-600 p-1 rounded shadow hover:bg-red-50"
                        title="Remove image"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3 space-y-2">
                    {/* Alt Text Editor */}
                    <div>
                      <label className="text-xs font-medium text-gray-700">Alt Text:</label>
                      {editingAlt === index ? (
                        <div className="flex items-center space-x-1 mt-1">
                          <input
                            type="text"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-bestea-400 focus:border-bestea-400"
                            placeholder="Enter alt text..."
                          />
                          <button
                            onClick={() => handleSaveAlt(index)}
                            className="text-bestea-600 hover:text-bestea-700 p-1"
                          >
                            <FaCheck size={10} />
                          </button>
                          <button
                            onClick={handleCancelAlt}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 mt-1">
                          <p className="flex-1 text-xs text-gray-600 truncate">
                            {image.alt || 'No alt text'}
                          </p>
                          <button
                            onClick={() => handleEditAlt(index)}
                            className="text-gray-400 hover:text-bestea-600 p-1"
                          >
                            <FaEdit size={10} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="text-xs text-gray-500">
                      <p>Position: {index + 1} of {images.length}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Image Guidelines:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use high-quality images (recommended: 800x800px or larger)</li>
              <li>• The main image will be displayed as the primary product image</li>
              <li>• Add descriptive alt text for better SEO and accessibility</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Maximum file size: 5MB per image</li>
              <li>• Maximum {maxImages} images per product</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
