'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  film: ShareFilm | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareFilm {
  id: string;
  user_id?: string;
  title: string;
  genre?: string;
  description?: string;
  artist?: string;
  creator_name?: string;
  user_email?: string;
  vote_count?: number;
  upvotes?: number;
}

export default function ShareModal({ film, isOpen, onClose }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !film) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/creator/${film.user_id}` : '';
  const shareText = `Check out "${film.title}" by ${film.artist || 'Apex Creator'} on Project-Apex! 🔥 Upvotes: ${film.vote_count || 0}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <Share2 className="w-3.5 h-3.5" /> Social Booster
          </div>
          <h2 className="text-2xl font-black text-white">Share Drop & Creator Card</h2>
          <p className="text-xs text-slate-400">Boost engagement by sharing your AI media drop across social channels.</p>
        </div>

        {/* Preview Card Graphic */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase">
            {film.genre || 'AI Media'}
          </div>
          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">Project-Apex Drop</span>
          <h3 className="text-lg font-black text-white">{film.title}</h3>
          <p className="text-xs text-slate-400 line-clamp-2">{film.description || 'AI-generated media masterpiece.'}</p>
          <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Creator: {film.artist || film.user_email?.split('@')[0] || 'Apex Creator'}</span>
            <span className="text-amber-400">🔥 {film.vote_count || 0} Votes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTwitterShare}
            className="w-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Share on Twitter / X
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
