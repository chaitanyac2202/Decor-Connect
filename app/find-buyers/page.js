'use client';

import { motion } from 'framer-motion';
import SearchForm from '@/components/SearchForm';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function FindBuyersPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-coral-400 mb-4"
          >
            Find Your Buyers
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-gray-400"
          >
            Enter your product details and discover potential buyers instantly.
          </motion.p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <SearchForm />
        </div>
      </motion.div>
    </div>
  );
}
