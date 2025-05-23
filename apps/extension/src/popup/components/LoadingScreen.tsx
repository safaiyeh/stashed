import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="w-96 h-[400px] bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingScreen; 