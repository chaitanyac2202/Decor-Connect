'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight, Package, Search, Send, Shield, Zap, Database } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import Footer from '@/components/Footer'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24 flex-grow flex items-center justify-center z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="flex items-center text-sm font-medium text-purple-300">
              <Sparkles className="w-4 h-4 mr-2" />
              The #1 Platform for Home Decor B2B Sales
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-coral-400 gradient-text"
          >
            Discover Home Decor Buyers Across America
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with retail stores, boutiques, and interior designers. Send personalized outreach emails with one click.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex justify-center">
            <Link href="/find-buyers">
              <button className="group relative flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full px-8 py-4 text-lg font-semibold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                Find Buyers Now
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-6 sm:px-12 lg:px-24 z-10 bg-[#0a0a1a]/80 backdrop-blur-lg border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 gradient-text">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Three simple steps to grow your wholesale business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Enter Your Product</h3>
              <p className="text-gray-400">
                Tell us about your home decor product and target market
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">We Find Buyers</h3>
              <p className="text-gray-400">
                Our engine searches real business data to find matching buyers
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff7f50]" />
              <div className="w-14 h-14 bg-[#ff7f50]/20 rounded-xl flex items-center justify-center mb-6">
                <Send className="w-7 h-7 text-[#ff7f50]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Send Outreach</h3>
              <p className="text-gray-400">
                Review and send personalized emails to potential buyers
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="relative py-24 px-6 sm:px-12 lg:px-24 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex items-start gap-4"
            >
              <Database className="w-8 h-8 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-lg font-bold mb-1">Real Business Data</h4>
                <p className="text-sm text-gray-400">We verify active retail stores and designers. No fake buyers.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex items-start gap-4"
            >
              <Zap className="w-8 h-8 text-cyan-400 shrink-0" />
              <div>
                <h4 className="text-lg font-bold mb-1">One-Click Outreach</h4>
                <p className="text-sm text-gray-400">Automated, personalized emails drafted specifically for each buyer.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex items-start gap-4"
            >
              <Shield className="w-8 h-8 text-[#ff7f50] shrink-0" />
              <div>
                <h4 className="text-lg font-bold mb-1">CAN-SPAM Compliant</h4>
                <p className="text-sm text-gray-400">Send legal outreach emails with automatic compliance built-in.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6 z-10 text-center border-t border-white/10 bg-gradient-to-b from-transparent to-purple-900/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-8">Ready to grow your home decor business?</h2>
          <Link href="/find-buyers">
            <button className="group relative inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full px-10 py-5 text-xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              Find Buyers Now
              <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
