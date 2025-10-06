import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRender: Date.now(),
    apiCalls: 0,
    cacheHits: 0,
  });

  const storeState = useSelector(state => ({
    cartItems: state.cart.items.length,
    productsCount: state.products.products.length,
    isAuthenticated: state.auth.isAuthenticated,
    cachedProductsCount: Object.keys(state.products.cache.singleProducts).length,
  }));

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRender: Date.now(),
    }));
  }, [storeState]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>Redux Performance Monitor</div>
      <div>Renders: {metrics.renderCount}</div>
      <div>Cart Items: {storeState.cartItems}</div>
      <div>Products Loaded: {storeState.productsCount}</div>
      <div>Cached Products: {storeState.cachedProductsCount}</div>
      <div>Auth: {storeState.isAuthenticated ? '✅' : '❌'}</div>
    </div>
  );
};

export default PerformanceMonitor;
