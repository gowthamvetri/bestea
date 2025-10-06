import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {fullScreen && (
        <p className="ml-3 text-gray-600">Loading...</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
