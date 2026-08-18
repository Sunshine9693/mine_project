import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div 
        className={`animate-spin rounded-full border-aura-lavender border-t-aura-primary-purple ${sizes[size]}`}
        style={{ borderStyle: 'solid' }}
      />
    </div>
  );
};

export default Loader;
