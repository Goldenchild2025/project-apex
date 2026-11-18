'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Film, 
  Trophy, 
  Crown, 
  Sparkles, 
  LayoutDashboard, 
  Upload, 
  X, 
  Play, 
  Music, 
  Disc, 
  Flame, 
  Radio, 
  HelpCircle, 
  Search, 
  TrendingUp, 
  Headphones, 
  MessageSquare, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  ThumbsUp
} from 'lucide-react';
import AuthModal from './AuthModal';
import LiveStation from './components/LiveStation';
import { useAuth } from '@/lib/AuthProvider';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import { handleVote as submitVote } from '@/lib/voting';

const PROJECT_APEX_GENRES = [
  'All',
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

function SupportTicketModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Ticket form states
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Billing & Stripe Tiers ($25 / $75)');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "WHAT IS PROJECT-APEX?",
      a: "Project-Apex is an elite web-based AI film festival and virtual artist ecosystem. Creators can publish drops, compete in live battle arenas, climb global leaderboards, and utilize our AI Studio Prompt Generator."
    },
    {
      q: "HOW DOES THE $25 FEATURED SPOTLIGHT BOOST WORK?",
      a: "The $25 featured film boost via Stripe checkout instantly pins your drop to the homepage spotlight rotation and grants priority visibility across community feeds."
    },
    {
      q: "WHAT IS INCLUDED IN THE $75 PRO PASS?",
      a: "The $75/mo Pro Pass grants unlimited AI movie hosting, priority rendering infrastructure, high-speed streaming bandwidth, and automatic entry into all championship tournament brackets."
    },
    {
      q: "WHAT SEPARATES THE $75 PRO PASS FROM THE $25 FEATURED SPOTLIGHT?",
      a: "The $25 Featured Spotlight is a one-time per-drop boost that instantly pins an individual track or film to the homepage rotation. In contrast, the $75/mo Pro Pass is a comprehensive monthly subscription granting unlimited AI movie hosting, priority rendering infrastructure, high-speed streaming bandwidth, and automatic entry into all championship tournament brackets."
    },
    {
      q: "WHY ARE AI MOVIES RESTRICTED TO PAID TIERS ($25 / $75)?",
      a: "Long-form AI cinematic movies require dedicated rendering infrastructure, high-speed streaming bandwidth, and priority homepage spotlight pinning. Therefore, the Standard ($0) free tier is reserved for audio tracks, shorts, and community ballots, while AI Movies utilize our Featured Spotlight ($25) or Pro Pass ($75/mo) tiers."
    },
    {
      q: "HOW DO I DEPLOY A VIRTUAL DROP?",
      a: "Click 'Upload Drop' in the top header or studio hero button, enter your track details and genre (AI Movies require paid tiers), and publish directly to the live platform stream."
    },
    {
      q: "HOW DOES THE LEADERBOARD & BATTLE ARENA WORK?",
      a: "Creators enter head-to-head AI battles and accumulate upvotes from community voting rounds. The next major tournament bracket and voting window opens on January 1, 2027."
    },
    {
      q: "HOW DO I SAVE MY CREATOR PROFILE?",
      a: "In your Creator Dashboard, fill out your Virtual Artist Moniker and Home Region in the Creator Profile box, then click 'Save Identity' to securely persist your changes to the Supabase database."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMessage) return;
    setTicketSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        <button 
          onClick={() => { onClose(); setTicketSubmitted(false); }} 
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header & Tabs */}
        <div className="space-y-4 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider">Project-Apex Help Desk & Pricing Guide</h3>
              <p className="text-[11px] text-slate-400">Explore platform rules, pricing tiers, or open a support ticket.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'faq'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Pricing & FAQs
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'ticket'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {activeTab === 'faq' ? (
            <div className="space-y-4">
              {/* Search Bar for FAQs */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search questions or pricing rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pricing Tiers Quick Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Standard Tier</span>
                  <div className="text-lg font-black text-white">$0 <span className="text-[10px] text-slate-500">Free</span></div>
                  <p className="text-[10px] text-slate-400">Audio tracks, shorts & community ballots.</p>
                </div>
                <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Popular</div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Featured Spotlight</span>
                  <div className="text-lg font-black text-white">$25 <span className="text-[10px] text-slate-500">/ drop</span></div>
                  <p className="text-[10px] text-slate-400">Instant homepage pinning & priority feed.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400">Pro Pass</span>
                  <div className="text-lg font-black text-white">$75 <span className="text-[10px] text-slate-500">/ mo</span></div>
                  <p className="text-[10px] text-slate-400">Unlimited AI movie hosting & tournament entry.</p>
                </div>
              </div>

              {/* Accordions */}
              <div className="space-y-3 pt-1">
                {filteredFaqs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No matching questions found.</p>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left font-black text-xs text-white uppercase tracking-wide hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div>
              {ticketSubmitted ? (
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Ticket Dispatched Successfully!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We've received your inquiry, <strong className="text-white">{ticketName}</strong>. Our support team will review and reply to <strong className="text-amber-400">{ticketEmail}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setTicketSubmitted(false); onClose(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer transition-all"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Your Name / Moniker</label>
                      <input
                        type="text"
                        required
                        placeholder="Jax Cypher"
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="creator@projectapex.ai"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Inquiry Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Billing & Stripe Tiers ($25 / $75)" className="bg-slate-900 text-white py-2">
                        Billing & Stripe Tiers ($25 / $75)
                      </option>
                      <option value="AI Movie Submission Rules" className="bg-slate-900 text-white py-2">
                        AI Movie Submission Rules
                      </option>
                      <option value="Leaderboard & Battle Arena" className="bg-slate-900 text-white py-2">
                        Leaderboard & Battle Arena
                      </option>
                      <option value="Supabase Profile & Account" className="bg-slate-900 text-white py-2">
                        Supabase Profile & Account
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your issue or billing question in detail..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-4 h-4" /> Dispatch Support Ticket
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Media Preview Modal for playing drops
function MediaPreviewModal({ drop, onClose }: { drop: Drop | null; onClose: () => void }) {
  if (!drop) return null;

  const isAudioFile = drop.video_url?.match(/\.(mp3|wav|m4a|aac)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Play className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase">{drop.title}</h3>
            <p className="text-[11px] text-slate-400">By {drop.artist} <span className="text-amber-400">{drop.genre}</span></p>
          </div>
        </div>

        <div className="w-full h-64 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
          {isAudioFile ? (
            <div className="w-full space-y-4 text-center p-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-white uppercase">{drop.title}</h3>
              <audio controls autoPlay src={drop.video_url} className="w-full accent-amber-500" />
            </div>
          ) : drop.video_url ? (
            <video src={drop.video_url} controls autoPlay className="w-full h-full object-cover" />
          ) : drop.artworkUrl ? (
            <img src={drop.artworkUrl} alt={drop.title} className="w-full h-full object-contain" />
          ) : (
            <Disc className="w-16 h-16 text-amber-400/40 animate-spin-slow" />
          )}
        </div>
      </div>
    </div>
  );
}

type Drop = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  region: string;
  plays: string;
  likes: string;
  badge: string;
  artworkUrl: string;
  video_url?: string;
  description?: string;
  imageBg: string;
};

const INITIAL_DROPS: Drop[] = [];

export default function HomePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [playingDrop, setPlayingDrop] = useState<Drop | null>(null);
  const isLoggedIn = Boolean(user);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [drops, setDrops] = useState<Drop[]>(INITIAL_DROPS);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollGenres = (direction: 'left' | 'right') => {
    const container = document.getElementById('genres-scroll-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;
    const loadFilms = async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('id', { ascending: false })
        .limit(24);

      if (error) {
        console.error('Could not load Project Apex drops:', error.message);
        return;
      }

      if (active && data) {
        setDrops(data.map((film, index) => ({
          id: String(film.id),
          title: film.title || 'Untitled Drop',
          artist: film.artist_name || film.creator_name || 'Apex Creator',
          genre: film.genre || 'Cyber Rap',
          region: 'Virtual Realm',
          plays: '—',
          likes: String(film.upvotes || 0),
          badge: film.is_featured ? 'Featured' : 'New Drop',
          artworkUrl: film.artwork_url || '',
          video_url: film.video_url || film.artwork_url || '',
          description: film.description || '',
          imageBg: index % 2 === 0 ? 'from-amber-500/20 to-orange-600/30' : 'from-purple-500/20 to-indigo-600/30',
        })));
      }
    };

    const refreshAfterSubmit = () => { void loadFilms(); };
    void loadFilms();
    window.addEventListener('apex-film-added', refreshAfterSubmit);

    // Realtime Supabase Subscription for Global Vote Sync
    const channel = supabase
      .channel('public:films:homepage')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'films' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDrops((prev) =>
              prev.map((d) => (String(d.id) === String(payload.new.id) ? { ...d, likes: String(payload.new.upvotes || 0) } : d))
            );
          } else if (payload.eventType === 'INSERT') {
            void loadFilms();
          } else if (payload.eventType === 'DELETE') {
            setDrops((prev) => prev.filter((d) => String(d.id) !== String(payload.old.id)));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      window.removeEventListener('apex-film-added', refreshAfterSubmit);
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      void signOut();
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleProtectedAction = (path: string) => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
    } else {
      router.push(path);
    }
  };

  // Direct interactive synchronized vote handler for drop cards
  const handleVoteClick = async (e: React.MouseEvent, filmId: string) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }

    const targetDrop = drops.find((d) => d.id === filmId);
    if (!targetDrop) return;

    const currentVotes = parseInt(targetDrop.likes) || 0;
    const res = await submitVote(filmId, currentVotes);

    if (res.success && res.newUpvotes !== undefined) {
      setDrops((prevDrops) =>
        prevDrops.map((drop) =>
          drop.id === filmId ? { ...drop, likes: String(res.newUpvotes!) } : drop
        )
      );
    } else {
      alert(res.message || 'Already voted or error voting.');
    }
  };

  const filteredDrops = drops.filter(drop => {
    const matchesGenre = selectedGenre === 'All' || drop.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch = drop.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drop.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pt-14 overflow-x-hidden">
      
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-base font-black tracking-wider text-white uppercase">
              PROJECT-<span className="text-amber-400">APEX</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
            <Link href="/" className="text-amber-400">
              Explore
            </Link>
            <Link href="/battles" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Battle Arena
            </Link>
            <Link href="/leaderboard" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
            </Link>
            <Link href="/awards" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Awards
            </Link>
            <button 
              onClick={() => handleProtectedAction('/dashboard')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 uppercase cursor-pointer bg-transparent border-none text-[11px] font-bold text-slate-300 p-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" /> Dashboard
            </button>
            <button 
              onClick={() => handleProtectedAction('/creator')}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Drop
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAuthAction}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Weather / Stock Market Style Continuous Ticker */}
      <div className="bg-slate-900/95 border-b border-amber-500/40 overflow-hidden py-3 px-4 sm:px-8 relative w-screen left-1/2 -translate-x-1/2 shadow-lg shadow-amber-500/5 flex items-center">
        <style jsx>{`
          @keyframes ticker {
            0% {
              transform: translate3d(100vw, 0, 0);
            }
            100% {
              transform: translate3d(-100%, 0, 0);
            }
          }
          .animate-ticker {
            display: inline-flex;
            white-space: nowrap;
            animation: ticker 32s linear infinite;
            will-change: transform;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="w-full overflow-hidden whitespace-nowrap flex">
          <div className="animate-ticker flex items-center gap-12">
            <div className="flex items-center gap-2 text-amber-400 shrink-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <Sparkles className="w-4 h-4 fill-amber-400" />
              <span className="font-black text-white text-xs uppercase tracking-widest">LIVE DROPS STREAM:</span>
            </div>

            {drops.length === 0 ? (
              <span className="text-slate-400 text-xs italic">No active live drops.</span>
            ) : (
              drops.map((d, i) => (
                <div key={`ticker-${d.id}`} className="flex items-center gap-3 border-l border-slate-800 pl-6 shrink-0">
                  <span className="text-amber-400 font-mono font-black text-xs">#{i + 1}</span>
                  <span className="text-white font-extrabold text-xs sm:text-sm">{d.title}</span>
                  <span className="text-slate-400 text-xs">by {d.artist}</span>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {d.likes} LIKES
                  </span>
                </div>
              ))
            )}

            <button
              onClick={() => handleProtectedAction('/creator')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md shadow-amber-500/20 ml-2"
            >
              + Deploy Drop
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-slate-950 py-12 sm:py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest shadow-lg shadow-amber-500/5">
            <Sparkles className="w-3.5 h-3.5" /> THE NEXT-GEN VIRTUAL ARTIST PLATFORM
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight max-w-4xl mx-auto leading-tight">
            Deploy & Rank Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Virtual Drops</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            Participate in live battle arenas, compete on global leaderboards, and publish your AI-generated tracks to worldwide audiences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              View Leaderboard
            </button>

            <button
              onClick={() => handleProtectedAction('/creator')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Upload Virtual Drop
            </button>
          </div>
        </div>
      </section>

      {/* Apex Live Station Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LiveStation />
      </section>

      {/* Genres & Categories Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Disc className="w-4 h-4 text-amber-400" /> Explore Categories & Genres
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Filter latest drops by standardized AI genre and style</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search artist or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="relative flex items-center group/scroll">
          <button
            onClick={() => scrollGenres('left')}
            className="absolute -left-2 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 shadow-xl transition-all cursor-pointer backdrop-blur-md"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            id="genres-scroll-container"
            className="flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-none scroll-smooth w-full"
          >
            {PROJECT_APEX_GENRES.map((g) => {
              const active = selectedGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  {g}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollGenres('right')}
            className="absolute -right-2 z-10 p-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 shadow-xl transition-all cursor-pointer backdrop-blur-md"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Virtual Drops Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Recent Virtual Drops
          </h2>
          <span className="text-[10px] text-slate-500 font-mono uppercase">
            Showing {filteredDrops.length} drops
          </span>
        </div>

        {filteredDrops.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-xs text-slate-400">No active drops found in this category.</p>
            <button
              onClick={() => handleProtectedAction('/creator')}
              className="bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
            >
              Deploy First Drop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredDrops.map((drop) => (
              <div
                key={drop.id}
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all hover:-translate-y-1 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3"
              >
                <div className="w-full h-52 rounded-xl bg-slate-950 border border-slate-800 relative flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform">
                  {drop.artworkUrl ? (
                    <img 
                      src={drop.artworkUrl} 
                      alt={drop.title} 
                      className="w-full h-full object-contain bg-slate-950" 
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${drop.imageBg} flex items-center justify-center`}>
                      <Disc className="w-10 h-10 text-amber-400/40 animate-spin-slow" />
                    </div>
                  )}
                  <button 
                    onClick={() => setPlayingDrop(drop)}
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-amber-500/30 cursor-pointer z-20"
                    title="Play Audio Stream"
                  >
                    <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                  </button>
                  <span className="absolute top-2.5 left-2.5 bg-slate-950/80 border border-slate-800 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                    {drop.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">{drop.genre}</span>
                  <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">{drop.title}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">{drop.artist}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{drop.region}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleVoteClick(e, drop.id)}
                      className="flex items-center gap-1.5 font-mono text-xs font-black text-amber-400 hover:text-amber-300 hover:scale-105 transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30 shadow-sm"
                      title="Click to Upvote Drop"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 fill-amber-400" /> {drop.likes} Upvotes
                    </button>
                  </div>

                  <button 
                    onClick={() => handleProtectedAction(`/battles?filmId=${drop.id}`)}
                    className="text-amber-400 hover:text-amber-300 font-bold uppercase text-[9px] flex items-center gap-0.5 cursor-pointer"
                  >
                    Battle <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Battle Arena Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-500/10 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
              <Trophy className="w-3 h-3" /> LIVE BATTLE ARENA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Test Your Virtual Track in Head-to-Head Battles
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Put your AI sound up against top creator drops in live community voting rounds. Gain points, climb leaderboard spots, and unlock trophies.
            </p>
            <div className="pt-1">
              <Link
                href="/battles"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
              >
                Enter Battle Arena <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <span className="block text-xl font-black text-amber-400">1,240+</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Battles Fought</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <span className="block text-xl font-black text-amber-400">350+</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Virtual Artists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex justify-center items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Film className="w-3 h-3" />
            </div>
            <span className="font-black text-slate-300 uppercase tracking-widest text-xs">PROJECT-APEX</span>
          </div>
          <div className="flex items-center justify-center gap-4 font-bold pt-1">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors bg-transparent border-none text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Help Desk & Pricing Guide
            </button>
            <span>•</span>
            <Link href="/battles" className="hover:text-white transition-colors">Battle Arena</Link>
            <span>•</span>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          </div>
          <p>© {new Date().getFullYear()} Project-Apex AI Virtual Artist Ecosystem. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SupportTicketModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <MediaPreviewModal drop={playingDrop} onClose={() => setPlayingDrop(null)} />
    </div>
  );
}