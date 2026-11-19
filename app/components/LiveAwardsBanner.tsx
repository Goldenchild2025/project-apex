'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, ArrowRight, Flame } from 'lucide-react';

export default function LiveAwardsBanner() {
  const pathname = usePathname();
  const isOnAwardsPage = pathname === '/awards';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full h-9 bg-gradient-to-r from-amber-500/15 via-slate-950 to-cyan-500/15 backdrop-blur-xl border-b border-amber-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-widest shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            LIVE BALLOT
          </span>
          <p className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Monthly Apex Awards voting is open — cast your official community ballot!
            </span>
          </p>
        </div>

        {!isOnAwardsPage ? (
          <Link
            href="/awards"
            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg transition-all shadow-sm shadow-amber-500/20 shrink-0"
          >
            <Flame className="w-3 h-3 fill-slate-950" />
            Vote Now
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold shrink-0">
            Ballot Active Below
          </span>
        )}
      </div>
    </div>
  );
}