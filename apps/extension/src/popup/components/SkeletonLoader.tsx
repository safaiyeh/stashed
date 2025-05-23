import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-96 bg-white animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>

      {/* Status Skeleton */}
      <div className="px-4 py-2">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader; 