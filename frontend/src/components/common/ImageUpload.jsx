import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({
  type = 'single', // 'single' or 'multiple'
  maxFiles = 5,
  maxSize = 5, // MB
  onUpload,
  onRemove,
  existingImages = [],
  className = '',
  accept = 'image/*',
  label = 'Upload Images'
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(existingImages);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than ${maxSize}MB`);
    }

    return true;
  };

  const handleFileSelect = (files) => {
    try {
      setError('');
      const fileArray = Array.from(files);

      // Validate file count for multiple uploads
      if (type === 'multiple' && fileArray.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
      }

      // Validate each file
      fileArray.forEach(validateFile);

      // Create preview URLs
      const newPreviews = fileArray.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));

      if (type === 'single') {
        setPreview(newPreviews);
      } else {
        setPreview(prev => [...prev, ...newPreviews]);
      }

      // Call upload handler
      if (onUpload) {
        setUploading(true);
        onUpload(type === 'single' ? fileArray[0] : fileArray)
          .catch(err => setError(err.message))
          .finally(() => setUploading(false));
      }

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index) => {
    const itemToRemove = preview[index];
    
    // Revoke object URL if it's a preview
    if (itemToRemove.url && itemToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.url);
    }

    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);

    if (onRemove && itemToRemove.publicId) {
      onRemove(itemToRemove.publicId);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={type === 'multiple'}
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <FaSpinner className="text-3xl text-green-400 animate-spin" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <FaCloudUploadAlt className="text-4xl text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">{label}</p>
              <p className="text-sm text-gray-500">
                Drag and drop {type === 'multiple' ? 'files' : 'a file'} here, or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: {maxSize}MB {type === 'multiple' && `• Max files: ${maxFiles}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview Grid */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {preview.map((item, index) => (
              <motion.div
                key={item.url || item.name || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Image Preview */}
                <div className="aspect-square relative">
                  <img
                    src={item.url}
                    alt={item.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>

                  {/* Main Image Indicator */}
                  {item.isMain && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {item.name || item.alt || 'Image'}
                  </p>
                  {item.size && (
                    <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Stats */}
      {type === 'multiple' && preview.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
          <span>{preview.length} of {maxFiles} files</span>
          <span>
            Total size: {formatFileSize(
              preview.reduce((total, item) => total + (item.size || 0), 0)
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
