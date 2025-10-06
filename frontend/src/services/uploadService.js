// API utility functions for image uploads
const API_BASE_URL = 'http://localhost:5000/api';

export const uploadService = {
  // Upload single product image
  uploadProductImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/upload/product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    return data;
  },

  // Upload multiple product images
  uploadProductImages: async (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/product/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload images');
    }
    return data;
  },

  // Upload user avatar
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload avatar');
    }
    return data;
  },

  // Delete image
  deleteImage: async (publicId) => {
    const response = await fetch(`${API_BASE_URL}/upload/delete/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete image');
    }
    return data;
  }
};
