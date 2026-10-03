'use client';

import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '@/context/AppContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Search, Mail, Send, Trash2, Calendar, MapPin, Package, ChevronDown, ChevronUp, BarChart3, MailCheck, Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#a855f7', '#06b6d4', '#f97316', '#22c55e', '#ef4444'];

export default function DashboardPage() {
  const { sentHistory, setSentHistory } = useContext(AppContext);
  const [expandedId, setExpandedId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [trackingStats, setTrackingStats] = useState({});
  const [isFetchingStats, setIsFetchingStats] = useState(true);

  // Fetch tracking stats for all recipients in history
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const history = sentHistory || [];
        const allTrackingIds = [];
        
        history.forEach(campaign => {
          campaign.recipients?.forEach(r => {
            if (r.trackingId) allTrackingIds.push(r.trackingId);
          });
        });

        if (allTrackingIds.length === 0) {
          setIsFetchingStats(false);
          return;
        }

        const res = await fetch('/api/track/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingIds: allTrackingIds })
        });
        
        if (res.ok) {
          const data = await res.json();
          setTrackingStats(data.results || {});
        }
      } catch (err) {
        console.error("Failed to fetch tracking stats", err);
      } finally {
        setIsFetchingStats(false);
      }
    };

    if (sentHistory && sentHistory.length > 0) {
      fetchTracking();
    } else {
      setIsFetchingStats(false);
    }
  }, [sentHistory]);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const history = sentHistory || [];
      const itemsToRecover = [];
      
      // Check for missing websites in old records
      history.forEach(campaign => {
        if (campaign.recipients && campaign.recipients.length > 0) {
          campaign.recipients.forEach(r => {
            if (r.website === undefined || r.website === null || r.website === 'N/A') {
              itemsToRecover.push({ name: r.name, location: campaign.location });
            }
          });
        }
      });
      
      let recoveredWebsites = {};
      
      // If we have old items with missing websites, fetch them
      if (itemsToRecover.length > 0) {
        try {
          const res = await fetch('/api/recover-websites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemsToRecover: itemsToRecover.slice(0, 40) }) // Limit to 40 so it doesn't take forever
          });
          if (res.ok) {
            const data = await res.json();
            recoveredWebsites = data.recovered || {};
          }
        } catch(e) {
          console.error("Recovery failed", e);
        }
      }

      const excelData = [];
      let updatedHistory = false;
      
      // Flatten history into rows and patch in recovered websites
      history.forEach(campaign => {
        const campaignDate = new Date(campaign.date);
        const formattedDate = `${String(campaignDate.getDate()).padStart(2, '0')}-${String(campaignDate.getMonth() + 1).padStart(2, '0')}-${campaignDate.getFullYear()}`;
        
        if (campaign.recipients && campaign.recipients.length > 0) {
          campaign.recipients.forEach(r => {
            // Only include successfully sent emails in the Excel sheet
            if (r.status !== 'sent' && r.status !== 'success') {
              return;
            }

            // Apply recovered website if we have it
            if ((r.website === undefined || r.website === null || r.website === 'N/A') && recoveredWebsites[r.name]) {
              r.website = recoveredWebsites[r.name];
              updatedHistory = true;
            }
            
            excelData.push({
              Date: formattedDate,
              'Campaign Time': campaignDate.toLocaleTimeString(),
              Category: campaign.productCategory,
              Location: campaign.location,
              'Buyer Name': r.name,
              'Buyer Email': r.email,
              'Website Link': r.website && r.website !== 'N/A' ? r.website : 'No website',
              _rawDate: campaignDate.getTime()
            });
          });
        }
      });
      
      // If we patched history, save it so we don't have to fetch next time
      if (updatedHistory) {
        setSentHistory([...history]);
        localStorage.setItem('decorconnect_history', JSON.stringify(history));
      }
      
      // Sort in ascending order (oldest to newest: e.g. 28, 29, 30)
      excelData.sort((a, b) => a._rawDate - b._rawDate);
      
      // Deduplicate the emails but KEEP all rows for the company report
      const uniqueExcelData = [];
      const seenEmails = new Set();
      
      excelData.forEach(row => {
        const email = row['Buyer Email'];
        if (email && email !== 'N/A' && email !== 'No email found' && email.includes('@')) {
          if (!seenEmails.has(email)) {
            seenEmails.add(email);
            uniqueExcelData.push(row);
          } else {
            // Keep the row, but clear the duplicate email so it doesn't look bad to the company
            uniqueExcelData.push({ ...row, 'Buyer Email': 'No email found' });
          }
        } else {
          uniqueExcelData.push(row);
        }
      });

      // Clean up the temporary raw date field before creating the sheet
      uniqueExcelData.forEach(row => delete row._rawDate);
      
      const worksheet = XLSX.utils.json_to_sheet(uniqueExcelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Email History");
      
      XLSX.writeFile(workbook, "DecorConnect_Email_History.xlsx");
    } catch (error) {
      console.error("Failed to export to Excel:", error);
      alert("Failed to generate Excel file.");
    }
  };

  const handleClearHistory = () => {
    if (showClearConfirm) {
      localStorage.removeItem('decorconnect_history');
      setSentHistory([]);
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
  
  // Calculate total opens
  let totalOpens = 0;
  Object.values(trackingStats).forEach(stat => {
    if (stat.opened) totalOpens += stat.totalOpens;
  });

  // Prepare Chart Data: Campaigns over time
  const chartData = history.slice().reverse().map((item, idx) => ({
    name: `Camp ${idx + 1}`,
    Sent: item.emailsSent || 0,
    Failed: item.emailsFailed || 0,
  }));

  // Prepare Chart Data: Categories
  const categoryCounts = {};
  history.forEach(item => {
    categoryCounts[item.productCategory] = (categoryCounts[item.productCategory] || 0) + 1;
  });
  const pieData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      <main className="flex-grow container mx-auto px-4 py-12 pt-24 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-orange-400 text-transparent bg-clip-text">
            Outreach Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Track your buyer discovery, email campaigns, and open rates
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
              Start by finding buyers and sending outreach emails. Your campaign history will appear here.
            </p>
            <Link href="/find-buyers">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full font-medium hover:from-purple-600 hover:to-cyan-600 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Find Buyers
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Search className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-3xl font-bold text-white">{totalSearches}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Campaigns</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Package className="w-6 h-6 text-cyan-400 mb-2" />
                <p className="text-3xl font-bold text-white">{totalBuyers}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Found</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Send className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-3xl font-bold text-white">{totalEmails}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Sent</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <Eye className="w-6 h-6 text-orange-400 mb-2" />
                <p className="text-3xl font-bold text-white">{totalOpens}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total Opens</p>
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <div className="md:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" /> Emails Sent vs Failed
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="Sent" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col">
                <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-400" /> Categories
                </h3>
                <div className="flex-grow flex items-center justify-center">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-400">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* History List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Campaign History</h3>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-all font-medium text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Export to Excel
                </button>
              </div>
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
                        {item.confirmationSent && (
                          <span className="flex items-center text-green-400 text-xs">
                            <MailCheck className="w-3.5 h-3.5 mr-1" /> Confirmation sent
                          </span>
                        )}
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
                          <span className="text-2xl font-bold text-green-400">{item.emailsSent}</span>
                          <span className="text-xs text-gray-400 flex items-center"><Send className="w-3 h-3 mr-1" /> Sent</span>
                        </div>
                        {item.emailsFailed > 0 && (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-red-400">{item.emailsFailed}</span>
                            <span className="text-xs text-gray-400">Failed</span>
                          </div>
                        )}
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
                          <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider flex justify-between items-center">
                            <span>Recipients</span>
                            {isFetchingStats && <span className="text-xs text-cyan-400 animate-pulse">Loading open stats...</span>}
                          </h4>
                          {item.recipients && item.recipients.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {item.recipients.map((rec, rIdx) => {
                                const stats = rec.trackingId ? trackingStats[rec.trackingId] : null;
                                const hasOpened = stats && stats.opened;
                                
                                return (
                                  <div key={rIdx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                                    <div className="flex-1 truncate pr-2">
                                      <p className="font-medium text-sm truncate">{rec.name}</p>
                                      <p className="text-xs text-gray-400 truncate">{rec.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${rec.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {rec.status === 'sent' ? 'Sent' : 'Failed'}
                                      </span>
                                      
                                      {rec.status === 'sent' && rec.trackingId && (
                                        <div className={`flex items-center text-xs gap-1 ${hasOpened ? 'text-orange-400' : 'text-gray-500'}`}>
                                          <Eye className="w-3.5 h-3.5" />
                                          {hasOpened ? `${stats.totalOpens} open${stats.totalOpens > 1 ? 's' : ''}` : 'Unopened'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
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

            {/* Clear History Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex justify-center pb-12"
            >
              <button
                onClick={handleClearHistory}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${showClearConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'}`}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {showClearConfirm ? 'Click again to confirm' : 'Clear History'}
              </button>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
