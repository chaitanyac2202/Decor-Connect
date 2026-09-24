"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  MailX,
  Star,
  CheckSquare,
  Square,
} from "lucide-react";

export default function BuyerCard({ buyer, isSelected, onToggle, index }) {
  const hasEmail = Boolean(buyer.email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={(e) => {
        // Prevent toggle if clicking a link
        if (e.target.tagName !== "A" && e.target.closest("a") === null) {
          onToggle(buyer.id);
        }
      }}
      className={`
        relative p-5 rounded-2xl border backdrop-blur-sm cursor-pointer
        transition-all duration-300
        ${
          isSelected
            ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            : "bg-white/5 border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        }
      `}
    >
      <div className="absolute top-4 right-4 text-gray-400">
        {isSelected ? (
          <CheckSquare className="w-6 h-6 text-purple-400" />
        ) : (
          <Square className="w-6 h-6" />
        )}
      </div>

      <div className="pr-10 mb-3">
        <h3 className="text-lg font-semibold text-white truncate" title={buyer.name}>
          {buyer.name}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {buyer.category && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
              {buyer.category}
            </span>
          )}
          {buyer.source && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/20">
              {buyer.source}
            </span>
          )}
          {buyer.rating && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-300" />
              {buyer.rating}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {buyer.address && (
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{buyer.address}</span>
          </div>
        )}
        
        {buyer.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{buyer.phone}</span>
          </div>
        )}
        
        {buyer.website && (
          <div className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <Globe className="w-4 h-4 shrink-0" />
            <a 
              href={buyer.website.startsWith('http') ? buyer.website : `https://${buyer.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="truncate underline underline-offset-2"
            >
              {buyer.website}
            </a>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
        {hasEmail ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
            <Mail className="w-3.5 h-3.5" />
            Email Found
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">
            <MailX className="w-3.5 h-3.5" />
            No Email
          </div>
        )}
      </div>
    </motion.div>
  );
}
