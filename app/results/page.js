"use client";

import { useContext, useState, useMemo } from 'react';
import { AppContext } from '@/context/AppContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import BuyerCard from '@/components/BuyerCard';
import EmailModal from '@/components/EmailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const { searchResults, sellerInfo } = useContext(AppContext);
  const router = useRouter();

  const [selectedBuyers, setSelectedBuyers] = useState(new Set());
  const [filter, setFilter] = useState('all'); // 'all', 'withEmail', 'withoutEmail'
  const [sort, setSort] = useState('default'); // 'default', 'name', 'email'
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const filteredAndSortedBuyers = useMemo(() => {
    if (!searchResults) return [];

    let result = [...searchResults];

    if (filter === 'withEmail') {
      result = result.filter(b => b.email);
    } else if (filter === 'withoutEmail') {
      result = result.filter(b => !b.email);
    }

    if (sort === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sort === 'email') {
      result.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    }

    return result;
  }, [searchResults, filter, sort]);

  const handleToggleBuyer = (id) => {
    setSelectedBuyers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedBuyers.size === filteredAndSortedBuyers.length) {
      setSelectedBuyers(new Set());
    } else {
      setSelectedBuyers(new Set(filteredAndSortedBuyers.map(b => b.id)));
    }
  };

  const selectedWithEmailCount = Array.from(selectedBuyers).filter(id => {
    const buyer = searchResults?.find(b => b.id === id);
    return buyer && buyer.email;
  }).length;

  if (!searchResults || searchResults.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a1a] text-gray-100 flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="z-10 text-center space-y-6 max-w-md p-8 glass-panel rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">No buyers found</h2>
            <p className="text-gray-400">Try broadening your search criteria to find more potential partners.</p>
            <Link 
              href="/find-buyers"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Back to Search
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-gray-100 relative overflow-hidden pb-32">
      <AnimatedBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 z-10 relative">
        <Link href="/find-buyers" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-coral-400 mb-2">
            Buyer Results
          </h1>
          <p className="text-gray-400">Found {searchResults.length} potential partners</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-md">
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleSelectAll}
              className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {selectedBuyers.size === filteredAndSortedBuyers.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-400">{selectedBuyers.size} selected</span>
          </div>

          <div className="flex gap-4 items-center w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 outline-none focus:border-purple-500/50"
              >
                <option value="all">All Buyers</option>
                <option value="withEmail">With Email</option>
                <option value="withoutEmail">No Email</option>
              </select>
            </div>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 outline-none focus:border-purple-500/50"
            >
              <option value="default">Default Sort</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
            </select>
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedBuyers.map((buyer, index) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                isSelected={selectedBuyers.has(buyer.id)}
                onToggle={handleToggleBuyer}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredAndSortedBuyers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No buyers match the current filters.
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {selectedWithEmailCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none"
          >
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-cyan-600 to-coral-600 rounded-full font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all hover:scale-105"
            >
              <Send className="w-5 h-5" />
              Send Outreach Email ({selectedWithEmailCount})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <EmailModal
            buyers={searchResults.filter(b => selectedBuyers.has(b.id) && b.email)}
            sellerInfo={sellerInfo}
            onClose={() => setIsEmailModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
