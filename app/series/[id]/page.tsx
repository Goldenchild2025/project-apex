'use client';

import React, { useState, useEffect } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import SubmitFilmModal from '../../components/SubmitFilmModal';
import AuthModal from '../../AuthModal';
import CommentSection from '../../components/CommentSection';
import { Play, ArrowLeft, Film, Heart } from 'lucide-react';

interface SeriesRecord {
  id: string;
  title: string;
  description?: string | null;
  total_votes?: number | null;
}

interface EpisodeRecord {
  id: string;
  title: string;
  genre?: string | null;
  description?: string | null;
  video_url?: string | null;
  created_at?: string;
}

export default function SeriesPage() {
  const { id: seriesId } = useParams<{ id: string }>();
  const [series, setSeries] = useState<SeriesRecord | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeRecord[]>([]);
  const [activeVideo, setActiveVideo] = useState<EpisodeRecord | null>(null);
  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;
    const fetchSeriesData = async () => {
      try {
        const { data: seriesData } = await supabase
          .from('series')
          .select('*')
          .eq('id', seriesId)
          .single();

        if (seriesData && active) {
          const record = seriesData as SeriesRecord;
          setSeries(record);
          setVotes(record.total_votes || 0);
        }

        const { data: epData } = await supabase
          .from('films')
          .select('*')
          .eq('series_id', seriesId)
          .order('created_at', { ascending: true });

        if (!active) return;
        const records = (epData ?? []) as EpisodeRecord[];
        setEpisodes(records);
        setActiveVideo(records[0] ?? null);
      } catch (err) {
        console.error('Error fetching series details:', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchSeriesData();
    const voted = localStorage.getItem(`apex_series_voted_${seriesId}`) === 'true';
    const timer = window.setTimeout(() => setHasVoted(voted), 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [seriesId]);

  async function handleVoteSeries() {
    if (hasVoted) {
      alert('You have already voted for this series!');
      return;
    }

    const newVotes = votes + 1;
    setVotes(newVotes);
    setHasVoted(true);
    localStorage.setItem(`apex_series_voted_${seriesId}`, 'true');

    try {
      await supabase
        .from('series')
        .update({ total_votes: newVotes })
        .eq('id', seriesId);
    } catch (err) {
      console.error('Error voting for series:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Loading Series Playlist...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Series Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full">
              BINGEABLE AI SAGA
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{series?.title || 'Saga Playlist'}</h1>
            <p className="text-xs sm:text-sm text-slate-400">{series?.description || 'AI Virtual Media Series'}</p>
          </div>

          <button
            onClick={handleVoteSeries}
            disabled={hasVoted}
            className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              hasVoted
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasVoted ? 'fill-slate-500' : 'fill-slate-950'}`} />
            {hasVoted ? 'Franchise Vote Recorded' : `Vote Series (${votes})`}
          </button>
        </div>

        {/* Video Player & Episode Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Player Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center shadow-2xl">
              {activeVideo?.video_url ? (
                <video src={activeVideo.video_url} controls className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Film className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Select an episode from the playlist to start watching.</p>
                </div>
              )}
            </div>

            {activeVideo && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  NOW PLAYING • {activeVideo.genre || 'SOUTHERN RAP'}
                </span>
                <h2 className="text-xl font-black text-white">{activeVideo.title}</h2>
                <p className="text-xs text-slate-400">{activeVideo.description}</p>
              </div>
            )}

            {/* Comment Section */}
            {activeVideo?.id && <CommentSection filmId={activeVideo.id} />}
          </div>

          {/* Episode List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> Season Episodes ({episodes.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {episodes.map((ep, idx) => {
                const isActive = activeVideo?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => setActiveVideo(ep)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-400 font-mono">EP {idx + 1}</span>
                      <span className="text-[10px] text-slate-500">{ep.genre}</span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1">{ep.title}</h4>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
