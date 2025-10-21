import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = 'medium', 
  variant = 'default',
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-green-50/30 to-white backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  // Default spinner variant
  const DefaultSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-gray-200 border-t-green-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );

  // Dots variant
  const DotsSpinner = () => (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-4 h-4' : 'w-3 h-3'} bg-green-600 rounded-full`}
          animate={{
            y: ['0%', '-50%', '0%'],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );

  // Pulse variant
  const PulseSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-green-600 rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );

  // Dual ring variant
  const DualRingSpinner = () => (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-green-200 rounded-full absolute`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={`${sizeClasses[size]} border-4 border-transparent border-t-green-600 rounded-full`}
        animate={{ rotate: -360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );

  // Tea leaf spinner variant
  const TeaLeafSpinner = () => (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} flex items-center justify-center`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z"
            fill="currentColor"
            className="text-green-600"
          />
          <path
            d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z"
            fill="currentColor"
            className="text-green-500"
          />
        </svg>
      </motion.div>
    </div>
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      case 'dual':
        return <DualRingSpinner />;
      case 'tea':
        return <TeaLeafSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {renderSpinner()}
        {fullScreen && text && (
          <motion.p
            className="text-gray-700 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
      
      {fullScreen && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900 font-serif block">BESTEA</span>
              <span className="text-xs text-green-600 font-medium tracking-wider uppercase">Premium Tea Co.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
