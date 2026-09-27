"use client";

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2, XCircle, MailCheck, LayoutTemplate } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

export default function EmailModal({ buyers, sellerInfo, onClose }) {
  const { addToHistory } = useContext(AppContext);
  const [step, setStep] = useState('compose'); // compose, preview, sending, summary
  
  const [selectedTemplate, setSelectedTemplate] = useState('introduction');
  const initialTemplate = EMAIL_TEMPLATES.find(t => t.id === 'introduction');
  
  const [subject, setSubject] = useState(initialTemplate.subject(sellerInfo));
  const [body, setBody] = useState(initialTemplate.body(sellerInfo));

  const [results, setResults] = useState(null);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject(sellerInfo));
      setBody(template.body(sellerInfo));
    }
  };

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
      const sendResults = data.results || { sent: 0, failed: buyers.length, errors: ['Unknown error'], recipientDetails: [] };
      setResults(sendResults);

      // Save to dashboard history
      const historyRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productCategory: sellerInfo?.productCategory || 'Unknown',
        location: sellerInfo?.location || 'Unknown',
        buyersFound: buyers.length,
        emailsSent: sendResults.sent,
        emailsFailed: sendResults.failed,
        confirmationSent: sendResults.confirmationSent || false,
        recipients: (sendResults.recipientDetails || []).map(r => ({
          name: r.name,
          email: r.email,
          status: r.status,
          trackingId: r.trackingId
        })),
      };
      addToHistory(historyRecord);

    } catch (error) {
      const errorResults = { sent: 0, failed: buyers.length, errors: [error.message], recipientDetails: [] };
      setResults(errorResults);
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
              
              {/* Template Selector */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-purple-300 mb-3">
                  <LayoutTemplate className="w-4 h-4" />
                  Email Template
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EMAIL_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange({ target: { value: t.id } })}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                        selectedTemplate === t.id 
                          ? 'bg-purple-500/20 border-purple-500/50 text-white' 
                          : 'bg-black/40 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      }`}
                    >
                      <div className="font-medium mb-1">{t.name}</div>
                      <div className="text-xs opacity-70 truncate">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2 flex justify-between">
                  <span>Sending to {buyers.length} buyers</span>
                  <span className="text-purple-400 flex items-center gap-1"><MailCheck className="w-3.5 h-3.5" /> Open tracking enabled</span>
                </div>
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
                  rows={10}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors resize-none font-sans"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use [Buyer Name] as a placeholder for the recipient&apos;s business name.
                  CAN-SPAM compliance footer will be appended automatically.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
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
              
              <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
                <button
                  onClick={() => setStep('compose')}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors w-full sm:w-auto"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-medium transition-opacity w-full sm:w-auto"
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

              {/* Confirmation email notice */}
              {results.confirmationSent && (
                <div className="max-w-md mx-auto bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-200 flex items-start gap-3">
                  <MailCheck className="w-5 h-5 mt-0.5 shrink-0 text-green-400" />
                  <div>
                    <p className="font-semibold mb-1">Confirmation email sent!</p>
                    <p className="text-green-300/80">A detailed report of this campaign has been sent to <strong>{sellerInfo?.email}</strong>. Check your inbox.</p>
                  </div>
                </div>
              )}

              {/* Recipient details */}
              {results.recipientDetails && results.recipientDetails.length > 0 && (
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recipients</p>
                  {results.recipientDetails.map((r, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {r.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

              <div className="flex justify-center gap-4 pt-4">
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
