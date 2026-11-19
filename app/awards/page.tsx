'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Flame, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../AuthModal';
import SubmitFilmModal from '../components/SubmitFilmModal';
import { createClient, supabaseConfigured } from '@/lib/supabaseClient';

interface AwardNominee {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  baseVotes: number;
  votes: number;
}

const INITIAL_NOMINEES: AwardNominee[] = [
  { id: 'artist-jax', category: 'artist', name: 'Jax Cypher', subtitle: 'Undefeated 601 Trap / Anthem Series', baseVotes: 3420, votes: 3420 },
  { id: 'artist-byte', category: 'artist', name: 'ByteRider', subtitle: 'Cyberpunk Synthwave & Glitch Sagas', baseVotes: 1285, votes: 1285 },
  { id: 'video-jax', category: 'video', name: '601 Cypher (Episode 2: Capital Siege)', subtitle: 'Sora 4K Cinematic 808 Battle', baseVotes: 2150, votes: 2150 },
  { id: 'video-byte', category: 'video', name: 'Cyberpunk Anthem X', subtitle: 'Suno v3.5 Neural Beats', baseVotes: 980, votes: 980 },
];

export default function AwardsPage() {
  const [nominees, setNominees] = useState<AwardNominee[]>(INITIAL_NOMINEES);
  const [votedCategories, setVotedCategories] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submittingCategory, setSubmittingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  const loadVotesAndUser = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const activeUserId = user?.id ?? null;
    setCurrentUserId(activeUserId);

    const { data, error } = await supabase
      .from('award_votes')
      .select('user_id, category_id, nominee_id');

    if (!error && data) {
      const tally: Record<string, number> = {};
      const userVotes: Record<string, string> = {};

      for (const row of data as Array<{
        user_id: string;
        category_id: string;
        nominee_id: string;
      }>) {
        if (row.nominee_id) {
          tally[row.nominee_id] = (tally[row.nominee_id] || 0) + 1;
        }
        if (activeUserId && row.user_id === activeUserId && row.category_id && row.nominee_id) {
          userVotes[row.category_id] = row.nominee_id;
        }
      }

      setNominees(
        INITIAL_NOMINEES.map((n) => ({
          ...n,
          votes: n.baseVotes + (tally[n.id] || 0),
        }))
      );
      setVotedCategories(userVotes);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      if (!active) return;
      await loadVotesAndUser();
    };

    void init();

    if (!supabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const supabase = createClient();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrentUserId(session?.user?.id ?? null);
      void loadVotesAndUser();
    });

    const channel = supabase
      .channel('public:award_votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'award_votes' },
        () => {
          if (active) {
            void loadVotesAndUser();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [loadVotesAndUser]);

  async function handleVote(categoryId: string, nomineeId: string) {
    if (votedCategories[categoryId]) {
      alert(
        `You have already cast your official vote for the ${
          categoryId === 'artist' ? 'Virtual Artist of the Year' : 'Best AI Music Video'
        } category!`
      );
      return;
    }

    if (!supabaseConfigured) {
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const activeUserId = user?.id ?? currentUserId;
    if (!activeUserId) {
      setIsAuthOpen(true);
      return;
    }

    setSubmittingCategory(categoryId);

    try {
      const { error } = await supabase
        .from('award_votes')
        .insert({
          user_id: activeUserId,
          category_id: categoryId,
          nominee_id: nomineeId,
        });

      if (error) {
        if (error.code === '23505') {
          await loadVotesAndUser();
          alert('Your vote for this category is already recorded.');
          return;
        }
        console.error('Error recording award vote to Supabase:', error);
        alert('Could not record your vote right now. Please try again.');
        return;
      }

      setVotedCategories((prev) => ({ ...prev, [categoryId]: nomineeId }));
      await loadVotesAndUser();
    } finally {
      setSubmittingCategory(null);
    }
  }

  const artistNominees = nominees.filter((n) => n.category === 'artist');
  const videoNominees = nominees.filter((n) => n.category === 'video');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </Link>

          <div className="flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-400" /> OFFICIAL COMMUNITY BALLOT
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              MONTHLY APEX AWARDS
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Cast your official community votes for the top virtual artists, music videos, and AI cinematic drops of the season.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-xs font-mono uppercase tracking-widest">
            Loading awards ballot...
          </div>
        ) : (
          <div className="space-y-10">
            {/* Category 1: Virtual Artist of the Year */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                  CATEGORY • OFFICIAL BALLOT
                </span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {votedCategories['artist'] ? 'Vote Cast ✓' : 'Voting Open'}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase">Virtual Artist of the Year</h2>
                <p className="text-xs text-slate-400">Recognizing the most influential AI persona driving the digital ecosystem forward.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artistNominees.map((nominee) => {
                  const hasVotedThisCat = votedCategories['artist'] === nominee.id;
                  const isLocked = Boolean(votedCategories['artist']);
                  const isSubmitting = submittingCategory === 'artist';
                  return (
                    <div
                      key={nominee.id}
                      className={`bg-slate-950 border rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all ${
                        hasVotedThisCat ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/5' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                          {nominee.id === 'artist-jax' ? 'JACKSON, MS' : 'ATLANTA, GA'}
                        </span>
                        <h3 className="text-xl font-black text-white">{nominee.name}</h3>
                        <p className="text-xs text-slate-400 italic">“{nominee.subtitle}”</p>
                      </div>

                      <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {nominee.votes.toLocaleString()} Community Votes
                        </span>
                        <button
                          onClick={() => handleVote('artist', nominee.id)}
                          disabled={isLocked || isSubmitting}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            hasVotedThisCat
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isLocked || isSubmitting
                              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          }`}
                        >
                          {hasVotedThisCat ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
                          {isSubmitting ? 'Saving...' : hasVotedThisCat ? 'Voted ✓' : 'Click to Vote'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Best AI Music Video / Film */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                  CATEGORY • OFFICIAL BALLOT
                </span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {votedCategories['video'] ? 'Vote Cast ✓' : 'Voting Open'}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase">Best AI Music Video & Cinematic Drop</h2>
                <p className="text-xs text-slate-400">The highest-fidelity visual storytelling paired with generative audio specs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoNominees.map((nominee) => {
                  const hasVotedThisCat = votedCategories['video'] === nominee.id;
                  const isLocked = Boolean(votedCategories['video']);
                  const isSubmitting = submittingCategory === 'video';
                  return (
                    <div
                      key={nominee.id}
                      className={`bg-slate-950 border rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all ${
                        hasVotedThisCat ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-cyan-500/5' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                          {nominee.id === 'video-jax' ? 'JAX CYPHER DROP' : 'BYTERIDER DROP'}
                        </span>
                        <h3 className="text-xl font-black text-white">{nominee.name}</h3>
                        <p className="text-xs text-slate-400 italic">“{nominee.subtitle}”</p>
                      </div>

                      <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 font-bold">
                          <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> {nominee.votes.toLocaleString()} Community Votes
                        </span>
                        <button
                          onClick={() => handleVote('video', nominee.id)}
                          disabled={isLocked || isSubmitting}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            hasVotedThisCat
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isLocked || isSubmitting
                              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                          }`}
                        >
                          {hasVotedThisCat ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
                          {isSubmitting ? 'Saving...' : hasVotedThisCat ? 'Voted ✓' : 'Click to Vote'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}