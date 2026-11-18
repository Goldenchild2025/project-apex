'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function ChampionshipCountdown() {
  const targetDate = new Date('2027-01-01T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-orange-500/15 border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-xl">
      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
        <Trophy className="w-3.5 h-3.5" /> January 1, 2027 Championship Window
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
        AI Battle Stadium Grand Championship
      </h3>
      
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto pt-2">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="block text-xl font-mono font-black text-amber-400">{timeLeft.days}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="block text-xl font-mono font-black text-amber-400">{timeLeft.hours}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="block text-xl font-mono font-black text-amber-400">{timeLeft.minutes}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="block text-xl font-mono font-black text-amber-400">{timeLeft.seconds}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">Secs</span>
        </div>
      </div>
    </div>
  );
}