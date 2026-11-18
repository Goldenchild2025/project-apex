'use client';

import React from 'react';
import { X, Trophy, Crown } from 'lucide-react';

interface HallOfFameModalProps {
  onClose: () => void;
}

export default function HallOfFameModal({ onClose }: HallOfFameModalProps) {
  const legends = [
    {
      artist: 'Jax Cypher',
      title: 'Neon Magnolia Chronicles',
      award: 'Best Virtual Southern Rap Drop',
      votes: '14,250',
      origin: 'Jackson, MS',
      badge: 'FLAGSHIP CHAMPION',
    },
    {
      artist: 'ByteRider',
      title: 'Gridlock Protocol',
      award: 'Cyberpunk Lyricist of the Year',
      votes: '11,890',
      origin: 'Atlanta, GA',
      badge: 'STADIUM LEGEND',
    },
    {
      artist: 'Valkyrie AI',
      title: 'Synthesizer Dreams',
      award: 'Best Cinematic Visuals (Sora)',
      votes: '9,420',
      origin: 'Virtual Sphere',
      badge: 'EXCELLENCE AWARD',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <Crown className="w-3.5 h-3.5" /> Historical Champions
          </div>
          <h2 className="text-2xl font-black text-white">APEX HALL OF FAME</h2>
          <p className="text-xs text-slate-400">Celebrating top-voted virtual artists and award-winning AI media drops.</p>
        </div>

        {/* Winners Grid */}
        <div className="space-y-4">
          {legends.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Trophy className="w-3 h-3 fill-amber-400" /> {item.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{item.origin}</span>
                </div>
                <h3 className="text-lg font-black text-white">{item.artist}</h3>
                <p className="text-xs text-slate-300 font-medium">&ldquo;{item.title}&rdquo; — {item.award}</p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="block text-base font-black text-amber-400">🔥 {item.votes}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Apex Award Votes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
