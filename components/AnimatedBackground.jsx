'use client';

import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Purple blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed] blur-3xl opacity-20 animate-float"></div>
      
      {/* Cyan blob */}
      <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#06b6d4] blur-3xl opacity-15 animate-float-delayed"></div>
      
      {/* Coral blob */}
      <div className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#f97316] blur-3xl opacity-15 animate-float-slow"></div>
    </div>
  );
};

export default AnimatedBackground;
