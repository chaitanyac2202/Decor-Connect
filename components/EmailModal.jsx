"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function EmailModal({ buyers, sellerInfo, onClose }) {
  const [step, setStep] = useState('compose'); // compose, preview, sending, summary
  
  const [subject, setSubject] = useState(`Partnership Opportunity - ${sellerInfo?.businessName || 'Us'}`);
  const [body, setBody] = useState(
    `Dear [Buyer Name],\n\nI'm reaching out from ${sellerInfo?.businessName || '[Business Name]'} to introduce our ${sellerInfo?.productCategory || '[Product Category]'} collection.\n\n${sellerInfo?.productDescription || '[Product Description]'}\n\nWe believe our products would be a great fit for your store and customers. I'd love to discuss a potential partnership.\n\nBest regards,\n${sellerInfo?.name || '[Seller Name]'}\n${sellerInfo?.email || '[Seller Email]'}`
  );

  const [results, setResults] = useState(null);

  const handleSend = async () => {
    setStep('sending');
    
    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: buyers,
          subject,
          body,
          seller: sellerInfo
        })
      });
      
      const data = await response.json();
      setResults(data.results || { sent: 0, failed: buyers.length, errors: ['Unknown error'] });
    } catch (error) {
      setResults({ sent: 0, failed: buyers.length, errors: [error.message] });
    } finally {
      setStep('summary');
    }
  };

  const footerText = `This email was sent by ${sellerInfo?.businessName || 'Us'} (${sellerInfo?.email || 'email'}). To opt out of future emails, reply with STOP.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#111122]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {step === 'compose' && 'Compose Email'}
            {step === 'preview' && 'Preview Email'}
            {step === 'sending' && 'Sending Emails...'}
            {step === 'summary' && 'Sending Complete'}
          </h2>
          {step !== 'sending' && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'compose' && (
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Sending to {buyers.length} buyers</div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors resize-none font-sans"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use [Buyer Name] as a placeholder for the recipient's business name.
                  CAN-SPAM compliance footer will be appended automatically.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-medium transition-opacity"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-white text-black p-8 rounded-xl shadow-inner font-sans text-sm md:text-base leading-relaxed">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <p><strong>Subject:</strong> {subject}</p>
                  <p className="text-gray-600"><strong>From:</strong> {sellerInfo?.businessName || 'Us'} &lt;{sellerInfo?.email || 'email'}&gt;</p>
                </div>
                <div className="whitespace-pre-wrap mb-8">
                  {body.replace(/\[Buyer Name\]/g, buyers[0]?.name || 'Sample Buyer')}
                </div>
                <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
                  {footerText}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('compose')}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-medium transition-opacity"
                >
                  <Send className="w-4 h-4" />
                  Send {buyers.length} Emails
                </button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <div className="text-lg font-medium text-white">Sending {buyers.length} emails...</div>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-gray-400">Please do not close this window</p>
            </div>
          )}

          {step === 'summary' && results && (
            <div className="space-y-8 py-8">
              <div className="flex flex-col items-center text-center gap-4">
                {results.failed === 0 ? (
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : results.sent === 0 ? (
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 mb-2">
                    <XCircle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white">Sending Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{results.sent}</div>
                  <div className="text-sm text-gray-400">Successfully Sent</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-400">{results.failed}</div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
              </div>

              {results.errors?.length > 0 && (
                <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-200">
                  <p className="font-semibold mb-2">Errors encountered:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {results.errors.length > 3 && (
                      <li>...and {results.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
