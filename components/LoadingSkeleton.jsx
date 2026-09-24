'use client';

import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glass p-6 rounded-xl animate-pulse flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="w-3/4 h-6 bg-white/10 rounded"></div>
            <div className="w-1/4 h-6 bg-white/10 rounded-full"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-3 flex-grow">
            <div className="w-full h-4 bg-white/10 rounded"></div>
            <div className="w-5/6 h-4 bg-white/10 rounded"></div>
            <div className="w-4/6 h-4 bg-white/10 rounded"></div>
          </div>
          
          {/* Footer / Button */}
          <div className="mt-6">
            <div className="w-full h-10 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
