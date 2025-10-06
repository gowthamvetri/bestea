import React, { useState } from 'react';

const ProductImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/tea-placeholder.svg',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ProductImage;
