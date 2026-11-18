'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Zap, ArrowRight } from 'lucide-react';

interface BattlePreview {
  contestant_a_name?: string;
  contestant_b_name?: string;
  contestant_a_votes?: number;
  contestant_b_votes?: number;
}

export default function BattlePreviewCard() {
  const [battle, setBattle] = useState<BattlePreview | null>(null);

  useEffect(() => {
    async function fetchBattle() {
      try {
        const { data } = await supabase
          .from('battles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) setBattle(data as BattlePreview);
      } catch (err) {
        console.error('Battle fetch error:', err);
      }
    }
    fetchBattle();
  }, []);

  const nameA = battle?.contestant_a_name || 'Jax Cypher';
  const nameB = battle?.contestant_b_name || 'ByteRider';
  const totalVotes = (battle?.contestant_a_votes || 142) + (battle?.contestant_b_votes || 98);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" /> Featured Battle Arena
        </div>
        <h3 className="text-2xl font-black text-white">
          {nameA} vs. {nameB}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Watch their latest AI drops and cast your vote live in the stadium to crown this week&apos;s winner.
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="block text-xs font-bold text-amber-400">🔥 {totalVotes} Total Votes</span>
          <span className="text-[10px] text-slate-500 uppercase font-mono">Live Sockets Active</span>
        </div>
        <Link
          href="/battles"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          Enter Battle Arena <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
