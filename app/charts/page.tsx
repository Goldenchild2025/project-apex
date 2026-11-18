'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubmitFilmModal from '../components/SubmitFilmModal';
import AuthModal from '../AuthModal';
import MediaPreviewModal from '../components/MediaPreviewModal';
import { Trophy, Play, Pause, Disc, Flame, Volume2, SkipForward, SkipBack } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

type ChartTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  upvotes: number;
  video_url: string;
  artwork_url?: string;
};

export default function ChartsPage() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<any | null>(null);

  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Persistent Sticky Player State
  const [currentTrack, setCurrentTrack] = useState<ChartTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchTopTracks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('films')
        .select('id, title, creator_name, genre, upvotes, video_url, artwork_url')
        .order('upvotes', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching charts:', error.message);
      } else if (data) {
        setTracks(data.map(item => ({
          id: String(item.id),
          title: item.title || 'Untitled Drop',
          artist: item.creator_name || 'Apex Creator',
          genre: item.genre || 'AI Media',
          upvotes: item.upvotes || 0,
          video_url: item.video_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          artwork_url: item.artwork_url || ''
        })));
      }
      setLoading(false);
    };

    void fetchTopTracks();
  }, []);

  const playTrack = (track: ChartTrack) => {
    if (!track.video_url) return;

    if (audioElement) {
      audioElement.pause();
    }

    const newAudio = new Audio(track.video_url);
    newAudio.play().catch(err => console.error('Audio play error:', err));
    setAudioElement(newAudio);
    setCurrentTrack(track);
    setIsPlaying(true);

    newAudio.onended = () => {
      setIsPlaying(false);
    };
  };

  const togglePlayPause = () => {
    if (!audioElement) {
      if (tracks.length > 0) playTrack(tracks[0]);
      return;
    }

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32">
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 shadow-lg shadow-amber-500/5">
              <Trophy className="w-3.5 h-3.5" /> OFFICIAL LEADERBOARD
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              TOP 50 MEDIA DROPS
            </h1>
            <p className="text-xs text-slate-400">
              Real-time community upvotes updated directly via Supabase channels with live streaming.
            </p>
          </div>
        </div>

        {/* Leaderboard Tracks List */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-amber-400 animate-pulse">
            LOADING TOP 50 CHARTS...
          </div>
        ) : tracks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <p className="text-xs text-slate-400">No tracks found in the leaderboard yet.</p>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
            >
              Upload First Drop
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl divide-y divide-slate-800">
            {tracks.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-4 sm:p-5 transition-all hover:bg-slate-850 cursor-pointer group ${
                    isCurrent ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-mono font-black text-sm text-amber-400">
                      #{index + 1}
                    </span>
                    
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 relative">
                      {track.artwork_url ? (
                        <img src={track.artwork_url} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Disc className="w-6 h-6 text-amber-400/50" />
                      )}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {track.artist} • <span className="text-amber-400 font-semibold">{track.genre}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {track.upvotes} Upvotes
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center transition-all shadow-md cursor-pointer"
                    >
                      {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Persistent Sticky Bottom Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/30 px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 w-1/3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {currentTrack.artwork_url ? (
                  <img src={currentTrack.artwork_url} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <Disc className="w-6 h-6 text-amber-400 animate-spin-slow" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase truncate">{currentTrack.title}</h4>
                <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist} • <span className="text-amber-400">{currentTrack.genre}</span></p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 w-1/3">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
                    if (currentIndex > 0) playTrack(tracks[currentIndex - 1]);
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                </button>

                <button 
                  onClick={() => {
                    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
                    if (currentIndex < tracks.length - 1) playTrack(tracks[currentIndex + 1]);
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 w-1/3 text-right">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Apex Audio Engine Active</span>
            </div>

          </div>
        </div>
      )}

      {selectedFilm && (
        <MediaPreviewModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          onUpvote={async (id) => {
            console.log('Upvoted from charts:', id);
          }}
        />
      )}

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
