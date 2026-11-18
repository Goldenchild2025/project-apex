'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SubmitFilmModal from '../components/SubmitFilmModal';
import AuthModal from '../AuthModal';
import MediaPreviewModal from '../components/MediaPreviewModal';
import { Trophy, Flame, Sparkles, Play, ArrowUpRight } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';

type FilmRecord = {
  id: string;
  title: string;
  genre?: string;
  description?: string;
  ai_model?: string;
  creator_name?: string;
  upvotes?: number;
  video_url?: string;
  artwork_url?: string;
  is_featured?: boolean;
};

export default function ChartsPage() {
  const { user } = useAuth();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [films, setFilms] = useState<FilmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState<FilmRecord | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchTopFilms = async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('upvotes', { ascending: false })
        .limit(50);

      if (!active) return;
      if (!error && data) {
        setFilms(data);
      }
      setLoading(false);
    };

    void fetchTopFilms();

    // Supabase Realtime subscription for live chart/leaderboard synchronization
    const channel = supabase
      .channel('public:films:charts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'films' },
        (payload) => {
          if (!active) return;
          if (payload.eventType === 'UPDATE') {
            setFilms((current) =>
              current
                .map((f) => (String(f.id) === String(payload.new.id) ? { ...f, ...payload.new } : f))
                .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            );
          } else if (payload.eventType === 'INSERT') {
            setFilms((current) =>
              [...current, payload.new as FilmRecord].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            );
          } else if (payload.eventType === 'DELETE') {
            setFilms((current) => current.filter((f) => String(f.id) !== String(payload.old.id)));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  async function handleUpvote(id: string) {
    if (!supabaseConfigured) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAuthOpen(true);
        return;
      }

      const accessToken = session.access_token;

      // Call centralized secure voting endpoint
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ filmId: id }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'You have already upvoted this drop across the platform!');
        return;
      }

      // Update local state and resort immediately by upvotes descending
      setFilms((current) =>
        current
          .map((f) => (String(f.id) === String(id) ? { ...f, upvotes: result.newUpvotes } : f))
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      );

      if (selectedFilm && String(selectedFilm.id) === String(id)) {
        setSelectedFilm({ ...selectedFilm, upvotes: result.newUpvotes });
      }
    } catch (err) {
      console.error('Error recording upvote:', err);
      alert('Failed to register vote.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
              <Trophy className="w-3.5 h-3.5" /> OFFICIAL LEADERBOARD
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              TOP 50 MEDIA DROPS
            </h1>
            <p className="text-xs text-slate-400">
              Real-time community upvotes updated dynamically via Supabase.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs font-mono text-slate-500 uppercase tracking-widest">
            Loading Top Charts...
          </div>
        ) : films.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <p className="text-xs text-slate-400">No media drops found on the leaderboard yet.</p>
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthOpen(true);
                } else {
                  setIsSubmitOpen(true);
                }
              }}
              className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer"
            >
              Upload First Drop
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {films.map((film, index) => (
              <div
                key={film.id}
                onClick={() => setSelectedFilm(film)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                    index === 0 ? 'bg-amber-400 text-slate-950' :
                    index === 1 ? 'bg-slate-300 text-slate-950' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    #{index + 1}
                  </span>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-amber-400 uppercase">{film.genre || 'AI Media'}</span>
                      {film.is_featured && (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                          Featured Spotlight
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white truncate group-hover:text-amber-400 transition-colors">
                      {film.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      Created by <span className="text-slate-200 font-bold">{film.creator_name || 'Apex Creator'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleUpvote(film.id);
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-1.5 transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> {film.upvotes || 0}
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedFilm && (
        <MediaPreviewModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          onUpvote={(id) => void handleUpvote(id)}
        />
      )}

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}