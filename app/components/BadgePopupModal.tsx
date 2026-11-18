'use client';

import React from 'react';
import { Crown, Shield, CheckCircle2, X } from 'lucide-react';

interface BadgePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: 'featured' | 'pro';
}

export default function BadgePopupModal({ isOpen, onClose, tier = 'featured' }: BadgePopupModalProps) {
  if (!isOpen) return null;

  const isPro = tier === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md bg-slate-900 border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl ${
        isPro ? 'border-cyan-500/50 shadow-cyan-500/20' : 'border-amber-500/50 shadow-amber-500/20'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-950/50 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Icon Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
            isPro 
              ? 'bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 shadow-cyan-500/30' 
              : 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/30'
          }`}>
            {isPro ? <Shield className="w-10 h-10 fill-current" /> : <Crown className="w-10 h-10 fill-current" />}
          </div>

          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
            isPro 
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isPro ? '✨ Diamond Pro Pass Unlocked' : '⭐ Gold Creator Badge Unlocked'}
          </span>
        </div>

        {/* Titles & Descriptions */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {isPro ? 'Pro Pass VIP Active!' : 'Featured Spotlight Active!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isPro 
              ? 'Your $75/mo Pro Pass subscription is confirmed. Full creator suite, priority AI Battle Stadium placement, and zero platform friction are now enabled.'
              : 'Your Stripe payment has been confirmed. Your virtual drop is now pinned to the top homepage spotlight with priority ranking.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isPro
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-cyan-500/20'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Acknowledge & View Dashboard
        </button>

      </div>
    </div>
  );
}