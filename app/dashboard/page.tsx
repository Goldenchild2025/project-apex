'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Film, Sparkles, Flame, ShieldCheck, CreditCard, User, ArrowLeft, CheckCircle2, Plus, Crown, Shield, Trash2, Wand2, Video, Music, Image as ImageIcon, ExternalLink, Copy, Check, TrendingUp, Vote, Trophy, RefreshCw, LogOut, Lock, LogIn } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../AuthModal';
import SubmitFilmModal from '../components/SubmitFilmModal';
import BadgePopupModal from '../components/BadgePopupModal';
import LiveStation from '../components/LiveStation';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';

type FilmRecord = {
  id: string | number;
  title: string;
  genre: string;
  upvotes: number;
  is_featured: boolean;
  tier?: string;
  artwork_url?: string;
  created_at?: string;
  user_id?: string;
  artist_name?: string;
};

// Custom Telemetry Hook integrated directly
function useCreatorTelemetry(films: FilmRecord[]) {
  const [metrics, setMetrics] = useState({
    totalImpressions: 0,
    upvoteVelocity: 0,
    impressionGrowth: '+18.4%',
    boostRoiStatus: 'Standard' as 'Standard' | 'Optimized',
    activeBoostsCount: 0,
  });

  useEffect(() => {
    if (!films || films.length === 0) {
      setMetrics({
        totalImpressions: 120,
        upvoteVelocity: 0,
        impressionGrowth: '+0.0%',
        boostRoiStatus: 'Standard',
        activeBoostsCount: 0,
      });
      return;
    }

    const totalUpvotes = films.reduce((acc, f) => acc + (Number(f.upvotes) || 0), 0);
    const activeBoosts = films.filter(f => f.is_featured || (f.tier && f.tier !== 'free')).length;
    
    const estimatedImpressions = totalUpvotes * 45 + 120;
    const velocity = Number((totalUpvotes / films.length).toFixed(1));

    setMetrics({
      totalImpressions: estimatedImpressions,
      upvoteVelocity: velocity,
      impressionGrowth: activeBoosts > 0 ? '+24.8%' : '+18.4%',
      boostRoiStatus: activeBoosts > 0 ? 'Optimized' : 'Standard',
      activeBoostsCount: activeBoosts,
    });
  }, [films]);

  return metrics;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [films, setFilms] = useState<FilmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostingFilmId, setBoostingFilmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<'featured' | 'pro'>('featured');

  // Waitlist State
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);

  // Prompt Generator State
  const [promptTool, setPromptTool] = useState('Runway Gen-3');
  const [promptSubject, setPromptSubject] = useState('');
  const [promptStyle, setPromptStyle] = useState('Cinematic 8k, gritty neon lighting');
  const [generatedPromptResult, setGeneratedPromptResult] = useState('');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const [artistMoniker, setArtistMoniker] = useState('');
  const [artistRegion, setArtistRegion] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Wire up telemetry hook
  const telemetry = useCreatorTelemetry(films);

  useEffect(() => {
    const boostStatus = searchParams.get('boost');
    const tierParam = searchParams.get('tier') as 'featured' | 'pro';

    if (boostStatus === 'success') {
      if (tierParam === 'pro') {
        setActiveTier('pro');
        setSuccessMsg('💎 Pro Pass active! Your $75/mo Platinum/Diamond creator suite and priority voting allocation are unlocked.');
      } else {
        setActiveTier('featured');
        setSuccessMsg('🎉 Featured Spotlight active! Your $25/mo virtual drop is pinned to the top homepage spotlight.');
      }
      setIsBadgeModalOpen(true);
    } else if (boostStatus === 'cancelled') {
      setErrorMsg('Stripe checkout was cancelled.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: profileData } = session?.user ? await supabase
        .from('profiles')
        .select('moniker, region, subscription_tier')
        .eq('id', session.user.id)
        .maybeSingle() : { data: null };

      if (profileData && active) {
        if (profileData.moniker) setArtistMoniker(profileData.moniker);
        if (profileData.region) setArtistRegion(profileData.region);
        if (profileData.subscription_tier === 'pro') {
          setActiveTier('pro');
        }
      }

      // Fetch all films using .select('*') to prevent 400 Bad Request errors on missing columns
      const { data: filmsData, error: filmsError } = await supabase
        .from('films')
        .select('*')
        .order('id', { ascending: false });

      if (!active) return;
      if (!filmsError && filmsData) {
        setFilms(filmsData);
      }

      if (session?.user) {
        const { data: waitlistData, error: waitlistError } = await supabase
          .from('battle_waitlist')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!waitlistError && waitlistData) {
          setIsOnWaitlist(true);
        } else {
          setIsOnWaitlist(false);
        }
      }

      setLoading(false);
    };

    void fetchUserData();
    
    const handleFilmAdded = () => { void fetchUserData(); };
    window.addEventListener('apex-film-added', handleFilmAdded);

    const handleWaitlistEvent = () => { void fetchUserData(); };
    window.addEventListener('apex-waitlist-updated', handleWaitlistEvent);

    return () => { 
      active = false; 
      window.removeEventListener('apex-film-added', handleFilmAdded);
      window.removeEventListener('apex-waitlist-updated', handleWaitlistEvent);
    };
  }, [artistMoniker]);

  // Supabase Realtime Subscription for Instant Telemetry & Upvote Sync
  useEffect(() => {
    if (!supabaseConfigured) return;

    const channel = supabase
      .channel('public:films:dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'films' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setFilms((prevFilms) =>
              prevFilms.map((film) =>
                String(film.id) === String(payload.new.id)
                  ? { ...film, ...payload.new }
                  : film
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setFilms((prevFilms) => [payload.new as FilmRecord, ...prevFilms]);
          } else if (payload.eventType === 'DELETE') {
            setFilms((prevFilms) =>
              prevFilms.filter((film) => String(film.id) !== String(payload.old.id))
            );
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleExitWaitlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setLoadingWaitlist(true);

      const { error } = await supabase
        .from('battle_waitlist')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      setIsOnWaitlist(false);
      window.dispatchEvent(new Event('apex-waitlist-updated'));
      setSuccessMsg('✓ Successfully removed from the battle waitlist.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to exit waitlist.');
    } finally {
      setLoadingWaitlist(false);
    }
  };

  async function handleTierBoost(filmId: string | number, tier: 'featured' | 'pro') {
    setErrorMsg('');
    setBoostingFilmId(String(filmId));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAuthOpen(true);
        setBoostingFilmId(null);
        return;
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: session.user.id,
          email: session.user.email,
          filmId: String(filmId), 
          tier 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout.');

      if (data.url) window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout error.');
      setBoostingFilmId(null);
    }
  }

  async function handleDeleteFilm(filmId: string | number) {
    if (!confirm('Are you sure you want to delete this drop? It will be removed from the main explore feed.')) return;

    try {
      const { error } = await supabase
        .from('films')
        .delete()
        .eq('id', filmId);

      if (error) throw error;

      setFilms(prev => prev.filter(f => f.id !== filmId));
      window.dispatchEvent(new Event('apex-film-added'));
      router.refresh(); 
      setSuccessMsg('✓ Drop deleted successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete drop.');
    }
  }

  async function handleSaveIdentity() {
    setProfileSavedMsg(false);
    setErrorMsg('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAuthOpen(true);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          moniker: artistMoniker,
          region: artistRegion,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save creator profile.');
    }
  }

  const aiTools = [
    {
      category: 'Video Generation',
      icon: <Video className="w-5 h-5 text-amber-400" />,
      tools: [
        { name: 'Runway Gen-3 Alpha', desc: 'Cinematic hyper-realistic motion & text-to-video.', url: 'https://runwayml.com', promptTip: 'Cinematic 8k shot, gritty cyberpunk lighting, smooth dolly zoom' },
        { name: 'OpenAI Sora', desc: 'Complex scene generation with consistent physics.', url: 'https://openai.com/sora', promptTip: 'Drone shot flying through neon-lit futuristic southern streets' }
      ]
    },
    {
      category: 'Audio & Vocals',
      icon: <Music className="w-5 h-5 text-cyan-400" />,
      tools: [
        { name: 'ElevenLabs', desc: 'Ultra-realistic AI voice cloning & sound fx.', url: 'https://elevenlabs.io', promptTip: 'Deep resonant cinematic narrator voice, gritty undertones' },
        { name: 'Suno AI', desc: 'Full-track musical generation with custom lyrics.', url: 'https://suno.com', promptTip: 'Southern trap beat with heavy 808s and futuristic synth leads' }
      ]
    },
    {
      category: 'Visuals & Avatars',
      icon: <ImageIcon className="w-5 h-5 text-purple-400" />,
      tools: [
        { name: 'Midjourney v6', desc: 'Stunning concept art, textures, and keyframes.', url: 'https://midjourney.com', promptTip: 'Cyberpunk virtual artist portrait, dramatic rim lighting --ar 16:9' },
        { name: 'HeyGen / D-ID', desc: 'Talking avatar generation for virtual artists.', url: 'https://heygen.com', promptTip: 'Direct-to-camera performance sync with expressive lip movement' }
      ]
    }
  ];

  const handleGeneratePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const crafted = `[Tool: ${promptTool}] Subject: ${promptSubject}. Style: ${promptStyle}. High fidelity rendering, dynamic framing, 4k production quality.`;
    setGeneratedPromptResult(crafted);
  };

  const copyPrompt = (prompt: string, name: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalUpvotes = films.reduce((acc, f) => acc + (Number(f.upvotes) || 0), 0);

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />
        <main className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Creator Dashboard Locked</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              You must be signed in to manage your drops, view telemetry analytics, and access creator tools.
            </p>
          </div>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <LogIn className="w-4 h-4" /> Sign In / Register to Access
          </button>
        </main>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Creator Dashboard</h1>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload New Drop
            </button>
          </div>
        </div>

        {successMsg && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-xs text-emerald-200">{successMsg}</div>}
        {errorMsg && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-xs text-rose-200">{errorMsg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Portfolio Drops</span>
            <div className="text-2xl font-black text-white">{films.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Community Upvotes</span>
            <div className="text-2xl font-black text-amber-400">{totalUpvotes.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Subscriptions</span>
            <div className="text-2xl font-black text-cyan-400">{telemetry.activeBoostsCount}</div>
          </div>
        </div>

        <LiveStation />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Performance Analytics & Reach
            </h2>
            <span className="text-[10px] font-bold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full uppercase">
              Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Estimated Impressions</span>
              <div className="text-2xl font-black text-white">{telemetry.totalImpressions.toLocaleString()}</div>
              <p className="text-[10px] text-emerald-400 font-bold">↑ {telemetry.impressionGrowth} from last week</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Upvote Velocity</span>
              <div className="text-2xl font-black text-amber-400">{telemetry.upvoteVelocity} <span className="text-xs text-slate-500">avg/drop</span></div>
              <p className="text-[10px] text-slate-400">Community engagement ratio</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Boost ROI Status</span>
              <div className="text-2xl font-black text-cyan-400">{telemetry.boostRoiStatus}</div>
              <p className="text-[10px] text-slate-400">{telemetry.activeBoostsCount} active spotlight boosts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-base font-black text-white uppercase tracking-wider">Your Uploaded Films & Tiers</h2>

            {films.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                <p className="text-xs text-slate-400">No drops uploaded yet.</p>
                <button onClick={() => setIsSubmitOpen(true)} className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase">Upload First Drop</button>
              </div>
            ) : (
              <div className="space-y-4">
                {films.map((film) => (
                  <div key={film.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {film.artwork_url ? (
                        <img src={film.artwork_url} alt={film.title} className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-black text-amber-400 uppercase">{film.genre}</span>
                          {(film.is_featured || (film.tier && film.tier !== 'free')) && (
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {film.tier || 'Boosted Active'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-white">{film.title}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">Upvotes: <span className="text-amber-400 font-bold">{film.upvotes || 0}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleTierBoost(film.id, 'featured')}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-2 rounded-xl text-[10px] uppercase cursor-pointer"
                      >
                        Featured ($25/mo)
                      </button>
                      <button
                        onClick={() => handleTierBoost(film.id, 'pro')}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-3 py-2 rounded-xl text-[10px] uppercase cursor-pointer"
                      >
                        Pro Pass ($75/mo)
                      </button>
                      <button
                        onClick={() => handleDeleteFilm(film.id)}
                        className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 text-rose-400 hover:text-slate-950 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="Delete Drop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" /> Creator Profile
              </h2>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Public Virtual Badge</span>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span className="text-amber-400">{artistMoniker || 'Anonymous Creator'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-normal">{artistRegion || 'Global Realm'}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full uppercase">
                  Active ID
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Virtual Artist Moniker</label>
                  <input
                    type="text"
                    value={artistMoniker}
                    onChange={(e) => setArtistMoniker(e.target.value)}
                    placeholder="e.g. Shon Da Don"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white mt-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Home Region</label>
                  <input
                    type="text"
                    value={artistRegion}
                    onChange={(e) => setArtistRegion(e.target.value)}
                    placeholder="e.g. Jackson, MS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white mt-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleSaveIdentity}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-xl text-xs uppercase cursor-pointer transition-all"
                >
                  Save Identity
                </button>
                {profileSavedMsg && <p className="text-[11px] text-emerald-400 text-center font-bold">✓ Profile updated in Supabase!</p>}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Vote className="w-4 h-4 text-cyan-400" /> Ballot & Arena Tracker
                </h2>
                {isOnWaitlist && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Waitlist Active
                  </span>
                )}
              </div>

              <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Voting Bracket:</span>
                  <span className="text-amber-400 font-bold">Active (Round 3)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Leaderboard Standing:</span>
                  <span className="text-white font-bold">{films.length > 0 ? 'Top 15%' : 'Unranked'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Next Battle Window:</span>
                  <span className="text-cyan-400 font-bold">Jan 1, 2027</span>
                </div>
              </div>

              {isOnWaitlist ? (
                <div className="pt-1 flex items-center justify-between bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3.5">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white uppercase">Queued for Battle</p>
                    <p className="text-[9px] text-slate-400">You can exit anytime before matchmaking starts.</p>
                  </div>
                  <button
                    onClick={handleExitWaitlist}
                    disabled={loadingWaitlist}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" /> {loadingWaitlist ? 'Exiting...' : 'Exit Waitlist'}
                  </button>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5">
                  <span className="text-[11px] text-slate-400">Not currently in match queue.</span>
                  <Link
                    href="/battles"
                    className="text-amber-400 hover:text-amber-300 font-black text-[11px] uppercase"
                  >
                    Join Waitlist →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Studio Prompt Generator - Feature Gated for Pro Pass */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          {activeTier !== 'pro' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-black uppercase text-white tracking-wide">Pro Pass Exclusive Studio Suite</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upgrade your creator subscription to the $75/mo Pro Pass to unlock unlimited high-fidelity AI prompt generation, priority battle weighting, and advanced creator tools.
                </p>
              </div>
              {films.length > 0 ? (
                <button
                  onClick={() => handleTierBoost(films[0].id, 'pro')}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  ✨ Unlock Pro Pass ($75/mo)
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Upload a Drop to Unlock Pro Pass
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> AI Studio Prompt Generator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Craft, test, and optimize prompts for your virtual artist drops before publishing.</p>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full uppercase">
              Pro Suite
            </span>
          </div>

          <form onSubmit={handleGeneratePrompt} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Target Tool</label>
              <select 
                value={promptTool}
                onChange={(e) => setPromptTool(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Runway Gen-3">Runway Gen-3 Alpha</option>
                <option value="OpenAI Sora">OpenAI Sora</option>
                <option value="ElevenLabs">ElevenLabs Voice</option>
                <option value="Suno AI">Suno AI Music</option>
                <option value="Midjourney v6">Midjourney v6</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Subject / Concept</label>
              <input 
                type="text" 
                value={promptSubject}
                onChange={(e) => setPromptSubject(e.target.value)}
                placeholder="e.g. Futuristic southern rapper in neon alley"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <button 
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Generate Prompt
              </button>
            </div>
          </form>

          {generatedPromptResult && (
            <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="font-mono text-xs text-cyan-300 break-all">
                {generatedPromptResult}
              </div>
              <button
                onClick={() => copyPrompt(generatedPromptResult, 'custom-generator')}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedKey === 'custom-generator' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} Copy
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-400" /> Top AI Tools for Creators
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Industry-standard generation suites to power your next Project-Apex drop.</p>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full uppercase">
              Curated Stack
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiTools.map((category, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    {category.icon}
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">{category.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.tools.map((tool, tIdx) => (
                      <div key={tIdx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{tool.name}</span>
                          <a 
                            href={tool.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                            title="Open Tool"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{tool.desc}</p>
                        
                        <div className="pt-2 flex items-center justify-between bg-slate-950 rounded-lg px-2.5 py-1.5 border border-slate-800/50">
                          <span className="text-[10px] font-mono text-amber-400/90 truncate max-w-[180px]" title={tool.promptTip}>
                            "{tool.promptTip}"
                          </span>
                          <button
                            onClick={() => copyPrompt(tool.promptTip, tool.name)}
                            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer"
                          >
                            {copiedKey === tool.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <BadgePopupModal isOpen={isBadgeModalOpen} tier={activeTier} onClose={() => setIsBadgeModalOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}