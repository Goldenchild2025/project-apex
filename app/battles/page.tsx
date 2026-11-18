'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Film, Trophy, Crown, Sparkles, LayoutDashboard, Upload, Flame, Clock, Users, Shield, CheckCircle2, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../AuthModal';
import SubmitFilmModal from '../components/SubmitFilmModal';
import MediaPreviewModal from '../components/MediaPreviewModal';
import { useAuth } from '@/lib/AuthProvider';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

type FilmDrop = {
  id: string;
  title: string;
  artist_name: string;
  genre: string;
  upvotes: number;
  artwork_url?: string;
  video_url?: string;
  is_featured?: boolean;
};

type WaitlistEntry = {
  id: string;
  artist_moniker: string;
  film_title: string;
  genre: string;
  tier: string;
  created_at: string;
};

const PROJECT_APEX_GENRES = [
  'Cyber Rap',
  'Southern Hip-Hop / Southern Rap',
  'Southern AI Trap / 601 Sound',
  'Cyber Cinematic / AI Film',
  'Phonk & Dark Trap',
  'Esoteric / Spiritual Lofi',
  'Hyperpop & Glitchcore',
  'Synthwave',
  'AI Movies',
  'Short Films',
] as const;

function BattlesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetFilmId = searchParams.get('filmId');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<any | null>(null);
  
  // Arena Drops & Scrolling State
  const [drops, setDrops] = useState<FilmDrop[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Waitlist State
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(PROJECT_APEX_GENRES[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Genre filter for matchups
  const [matchupGenre, setMatchupGenre] = useState('all');

  // Voting state
  const [totalBattles, setTotalBattles] = useState(1240);
  const [votedMatchups, setVotedMatchups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;
    const fetchArenaData = async () => {
      // 1. Fetch waitlist
      const { data: waitlistData } = await supabase
        .from('battle_waitlist')
        .select('*')
        .order('created_at', { ascending: true });

      if (active && waitlistData) setWaitlist(waitlistData);

      // 2. Fetch all films ordered by upvotes for scrolling matchups
      const { data: filmsData, error } = await supabase
        .from('films')
        .select('*')
        .order('upvotes', { ascending: false });

      if (!active) return;
      if (!error && filmsData) {
        if (targetFilmId) {
          const targetIndex = filmsData.findIndex(f => String(f.id) === String(targetFilmId));
          if (targetIndex > 0) {
            const [targetFilm] = filmsData.splice(targetIndex, 1);
            filmsData.unshift(targetFilm);
          }
        }
        setDrops(filmsData);
      }
    };

    void fetchArenaData();

    // Realtime sync for votes & new drops in the arena
    const channel = supabase
      .channel('public:films:battles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'films' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDrops((prev) =>
              prev.map((d) => (String(d.id) === String(payload.new.id) ? { ...d, ...payload.new } : d))
            );
          } else if (payload.eventType === 'INSERT') {
            setDrops((prev) => [payload.new as FilmDrop, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [targetFilmId]);

  // Fetch user's existing votes from Supabase on mount/auth change
  useEffect(() => {
    if (!supabaseConfigured || !user) return;

    const fetchUserVotes = async () => {
      const { data: votes, error } = await supabase
        .from('film_votes')
        .select('film_id')
        .eq('user_id', user.id);

      if (!error && votes) {
        const votedMap: Record<string, boolean> = {};
        votes.forEach(v => {
          votedMap[String(v.film_id)] = true;
        });
        setVotedMatchups(votedMap);
      }
    };

    void fetchUserVotes();
  }, [user]);

  // Safe Pairing Logic: Prevent drop from fighting itself
  const champion = drops[currentIndex] || drops[0];
  const candidateChallenger = drops[currentIndex + 1] || drops[0];
  const challenger = (drops.length > 1 && candidateChallenger?.id !== champion?.id) 
    ? candidateChallenger 
    : null;

  const handleNextMatchup = () => {
    if (drops.length <= 2) return;
    setCurrentIndex((prev) => (prev + 2 >= drops.length ? 0 : prev + 2));
  };

  const handlePrevMatchup = () => {
    if (drops.length <= 2) return;
    setCurrentIndex((prev) => (prev - 2 < 0 ? Math.max(0, drops.length - 2) : prev - 2));
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!trackTitle.trim()) {
      setErrorMsg('Please enter your track or drop title.');
      return;
    }

    setIsJoining(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('moniker')
        .eq('id', user.id)
        .maybeSingle();

      const artistMoniker = profile?.moniker || user.email?.split('@')[0] || 'Apex Creator';

      const { data, error } = await supabase
        .from('battle_waitlist')
        .insert({
          user_id: user.id,
          artist_moniker: artistMoniker,
          film_title: trackTitle.trim(),
          genre: selectedGenre,
          tier: 'Featured / Pro'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWaitlist([...waitlist, data]);
        setSuccessMsg('🎉 Successfully locked into the Battle Arena queue!');
        setTrackTitle('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to join waitlist.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleVote = async (targetId: string, currentVotes: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (votedMatchups[String(targetId)]) {
      alert('You have already voted for this drop!');
      return;
    }

    try {
      // 1. Record vote in database table securely
      const { error: voteError } = await supabase
        .from('film_votes')
        .insert({ user_id: user.id, film_id: targetId });

      if (voteError) {
        if (voteError.code === '23505') {
          alert('You have already voted for this drop!');
          setVotedMatchups((prev) => ({ ...prev, [String(targetId)]: true }));
          return;
        }
        throw voteError;
      }

      // 2. Increment upvotes on films table and local state
      const newVotes = (currentVotes || 0) + 1;
      setVotedMatchups((prev) => ({ ...prev, [String(targetId)]: true }));
      setTotalBattles(prev => prev + 1);

      setDrops((prev) =>
        prev.map((d) => (String(d.id) === String(targetId) ? { ...d, upvotes: newVotes } : d))
      );

      if (supabaseConfigured) {
        await supabase
          .from('films')
          .update({ upvotes: newVotes })
          .eq('id', targetId);
      }
    } catch (err: any) {
      console.error('Voting error:', err);
      alert(err.message || 'Failed to register vote.');
    }
  };

  const filteredWaitlist = matchupGenre === 'all' 
    ? waitlist 
    : waitlist.filter(item => item.genre.toLowerCase() === matchupGenre.toLowerCase());

  const hasDrops = drops.length > 0;

  const championVoted = Boolean(champion && votedMatchups[String(champion.id)]);
  const challengerVoted = Boolean(challenger && votedMatchups[String(challenger.id)]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pt-14">
      <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header & Matchup Scroller Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Explore
            </Link>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" /> REIGNING CHAMPION ARENA
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Championship Battle Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Scroll through active matchups, test your virtual tracks, and vote in live community tournament rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasDrops && drops.length > 2 && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl">
                <button
                  onClick={handlePrevMatchup}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-xs font-mono text-amber-400 px-2 font-bold whitespace-nowrap">
                  Match {Math.floor(currentIndex / 2) + 1} of {Math.max(1, Math.ceil(drops.length / 2))}
                </span>
                <button
                  onClick={handleNextMatchup}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-500/20"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-lg font-black text-amber-400">{totalBattles.toLocaleString()}</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Total Battles Fought</span>
              </div>
            </div>
          </div>
        </div>

        {/* Head-to-Head Arena Voting Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Championship Matchup • Accepting All Challengers
            </h2>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Filter Matchup:</span>
              <select
                value={matchupGenre}
                onChange={(e) => setMatchupGenre(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 uppercase cursor-pointer"
              >
                <option value="all">All Genres (Global)</option>
                {PROJECT_APEX_GENRES.map((g) => (
                  <option key={`matchup-${g}`} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!hasDrops ? (
            <div className="w-full h-72 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Arena Empty
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">NO ACTIVE DROPS IN ARENA</h3>
                <p className="text-xs text-slate-400">Deploy a virtual drop to initialize the championship matchup.</p>
              </div>
              <button
                onClick={() => (user ? setIsSubmitOpen(true) : setIsAuthOpen(true))}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                + Upload Drop to Arena
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-15">
              
              {/* Contender 1: REIGNING CHAMPION */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all space-y-4 shadow-xl">
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-amber-500/30 via-orange-600/20 to-slate-900 border border-amber-500/40 flex items-center justify-center relative group overflow-hidden">
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-md z-10">
                    👑 Reigning Champion
                  </span>
                  {champion?.artwork_url ? (
                    <img src={champion.artwork_url} alt={champion.title} className="w-full h-full object-cover" />
                  ) : null}
                  {champion?.video_url && (
                    <button 
                      onClick={() => setSelectedFilm(champion)} 
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform cursor-pointer z-20"
                      title="Preview & Play Stream"
                    >
                      ▶
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 uppercase font-black">{champion?.genre || 'Cyber Rap'}</span>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    {champion?.title || 'Untitled Drop'} <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">By <span className="text-amber-400">{champion?.artist_name || 'King Ducko'}</span></p>
                  <p className="text-[10px] text-slate-400 font-mono">Status: Defending Title ({champion?.upvotes || 0} Upvotes)</p>
                </div>

                <button
                  onClick={() => handleVote(champion.id, champion.upvotes)}
                  disabled={championVoted}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    championVoted
                      ? 'bg-emerald-500 text-slate-950 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {championVoted ? '✓ Vote Recorded' : 'Vote For Champion'}
                </button>
              </div>

              {/* Contender 2: OPEN CHALLENGER OR WAITING SLOT */}
              {challenger ? (
                <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all space-y-4 shadow-xl">
                  <div className="w-full h-48 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center relative group overflow-hidden">
                    <span className="absolute top-3 left-3 bg-cyan-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-md z-10">
                      ⚡ Open Challenger
                    </span>
                    {challenger?.artwork_url ? (
                      <img src={challenger.artwork_url} alt={challenger.title} className="w-full h-full object-cover" />
                    ) : null}
                    {challenger?.video_url && (
                      <button 
                        onClick={() => setSelectedFilm(challenger)} 
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform cursor-pointer z-20"
                        title="Preview & Play Stream"
                      >
                        ▶
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase font-black">{challenger?.genre || 'Synthwave'}</span>
                    <h3 className="text-lg font-black text-white">{challenger?.title || 'Challenger Drop'}</h3>
                    <p className="text-xs text-slate-400 font-bold">By <span className="text-cyan-400">{challenger?.artist_name || 'Challenger'}</span></p>
                    <p className="text-[10px] text-slate-400 font-mono">Status: Seeking Upset ({challenger?.upvotes || 0} Upvotes)</p>
                  </div>

                  <button
                    onClick={() => handleVote(challenger.id, challenger.upvotes)}
                    disabled={challengerVoted}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      challengerVoted
                        ? 'bg-emerald-500 text-slate-950 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    }`}
                  >
                    {challengerVoted ? '✓ Vote Recorded' : 'Vote This Challenger'}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Waiting for Challenger
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">CHALLENGER SLOT OPEN</h3>
                    <p className="text-xs text-slate-400">Waiting for a second track or another creator to lock into the queue.</p>
                  </div>
                  <button
                    onClick={() => (user ? setIsSubmitOpen(true) : setIsAuthOpen(true))}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    + Submit Challenger Drop
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* BATTLE ARENA WAITLIST & QUEUE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Join Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit">
            <div className="space-y-1">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Enter Battle Queue
              </h2>
              <p className="text-xs text-slate-400">Enter the waitlist to step into the ring against the champion.</p>
            </div>

            {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold">{successMsg}</div>}
            {errorMsg && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold">{errorMsg}</div>}

            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Track / Drop Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 601 Challenger Anthem"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Battle Genre Category</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 uppercase font-bold"
                >
                  {PROJECT_APEX_GENRES.map((g) => (
                    <option key={`queue-${g}`} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                {isJoining ? 'Locking in Queue...' : 'Lock Into Challenger Queue'}
              </button>
            </form>
          </div>

          {/* Live Queue Feed */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Active Challengers ({filteredWaitlist.length})
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Next Window: Jan 1, 2027</span>
            </div>

            {filteredWaitlist.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                <p className="text-xs text-slate-400">No active challengers found for this genre filter.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredWaitlist.map((item, index) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs text-amber-400">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-white">{item.film_title}</h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                          Challenger: <span className="text-amber-400 font-bold">{item.artist_moniker}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-cyan-400">{item.genre}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full uppercase">
                      Ready to Battle
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Global Media Preview Modal */}
      {selectedFilm && (
        <MediaPreviewModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          onUpvote={async (id) => {
            console.log('Upvoted from battle modal:', id);
          }}
        />
      )}

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function BattlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">Loading Battle Arena...</div>}>
      <BattlesContent />
    </Suspense>
  );
}