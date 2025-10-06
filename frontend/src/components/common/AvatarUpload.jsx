import React, { useState, useRef } from 'react';
import { FaCamera, FaSpinner, FaUser } from 'react-icons/fa';
import { uploadService } from '../../services/uploadService';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';

const AvatarUpload = ({ 
  currentAvatar, 
  onUpdate, 
  size = 'large', // 'small', 'medium', 'large'
  editable = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 14,
    medium: 18,
    large: 24
  };

  const handleFileSelect = async (file) => {
    try {
      setError('');
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
        throw new Error('File size must be less than 2MB');
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setUploading(true);

      // Upload to Cloudinary
      const response = await uploadService.uploadAvatar(file);
      
      if (response.success) {
        // Update user profile in Redux store
        dispatch(updateUserProfile({
          avatar: response.data.avatar
        }));

        // Call parent callback if provided
        if (onUpdate) {
          onUpdate(response.data.avatar);
        }

        // Clean up preview
        URL.revokeObjectURL(previewUrl);
        setPreview(null);
      }

    } catch (err) {
      setError(err.message);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const avatarUrl = preview || getAvatarUrl({ avatar: currentAvatar }) || getAvatarUrl(user);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Display */}
      <div
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} 
          relative rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-lg
          ${editable && !uploading ? 'cursor-pointer group' : ''}
          ${uploading ? 'opacity-50' : ''}
        `}
      >
        {/* Avatar Image or Default */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            onError={handleAvatarError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FaUser className="text-gray-400" size={iconSizes[size]} />
          </div>
        )}

        {/* Upload Overlay */}
        {editable && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <FaCamera className="text-white" size={iconSizes[size]} />
          </div>
        )}

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <FaSpinner className="text-white animate-spin" size={iconSizes[size]} />
          </div>
        )}

        {/* Camera Icon for Small Avatars */}
        {editable && !uploading && size === 'small' && (
          <div className="absolute -bottom-1 -right-1 bg-bestea-500 text-white rounded-full p-1 shadow-md">
            <FaCamera size={10} />
          </div>
        )}
      </div>

      {/* File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
          className="hidden"
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-1 rounded z-10">
          {error}
        </div>
      )}

      {/* Upload Helper Text */}
      {editable && size === 'large' && !uploading && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-gray-500 text-center whitespace-nowrap">
          Click to change avatar
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
