'use client';

import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '@/context/AppContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/Footer';
import { Clock, Search, Mail, Send, Trash2, Calendar, MapPin, Package, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { sentHistory, setSentHistory } = useContext(AppContext);
  const [expandedId, setExpandedId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = () => {
    if (showClearConfirm) {
      localStorage.removeItem('decorconnect_history');
      if (setSentHistory) {
        setSentHistory([]);
      }
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const history = sentHistory || [];
  const totalSearches = history.length;
  const totalBuyers = history.reduce((acc, curr) => acc + (curr.buyersFound || 0), 0);
  const totalEmails = history.reduce((acc, curr) => acc + (curr.emailsSent || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      <main className="flex-grow container mx-auto px-4 py-12 pt-24 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-coral-400 text-transparent bg-clip-text">
            Outreach Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Track your buyer discovery and email campaigns
          </p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl"
          >
            <BarChart3 className="w-24 h-24 text-gray-500 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No outreach history yet</h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              Start by finding buyers and sending outreach emails
            </p>
            <Link href="/find-buyers">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full font-medium hover:from-purple-600 hover:to-cyan-600 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Find Buyers
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Search className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Searches</p>
                  <p className="text-3xl font-bold">{totalSearches}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Package className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Buyers Found</p>
                  <p className="text-3xl font-bold">{totalBuyers}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
                <div className="p-3 bg-coral-500/20 rounded-xl">
                  <Mail className="w-8 h-8 text-coral-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Emails Sent</p>
                  <p className="text-3xl font-bold">{totalEmails}</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {history.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/[0.07] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    onClick={() => toggleExpand(item.id || index)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-lg font-semibold"><Package className="w-5 h-5 mr-2 text-cyan-400" /> {item.productCategory}</span>
                        <span className="flex items-center text-gray-300"><MapPin className="w-4 h-4 mr-1 text-purple-400" /> {item.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 w-full md:w-auto">
                      <div className="flex items-center space-x-6 flex-1 md:flex-none justify-between md:justify-end">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-white">{item.buyersFound}</span>
                          <span className="text-xs text-gray-400 flex items-center"><Search className="w-3 h-3 mr-1" /> Found</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-white">{item.emailsSent}</span>
                          <span className="text-xs text-gray-400 flex items-center"><Send className="w-3 h-3 mr-1" /> Sent</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedId === (item.id || index) ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === (item.id || index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-black/20"
                      >
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Recipients</h4>
                          {item.recipients && item.recipients.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {item.recipients.map((rec, rIdx) => (
                                <div key={rIdx} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{rec.name}</p>
                                    <p className="text-xs text-gray-400">{rec.email}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${rec.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {rec.status === 'sent' ? 'Sent' : 'Failed'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No recipient details available.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex justify-center"
            >
              <button
                onClick={handleClearHistory}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${showClearConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'}`}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {showClearConfirm ? 'Are you sure?' : 'Clear History'}
              </button>
            </motion.div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
