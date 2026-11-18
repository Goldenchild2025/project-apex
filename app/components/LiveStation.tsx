'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Radio, Sparkles, Flame, Volume2, Music, VolumeX } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

type LiveTrack = {
  id: string;
  title: string;
  creator_name?: string;
  genre?: string;
  upvotes?: number;
  video_url?: string; // Can hold audio/video stream URL
};

export default function LiveStation() {
  const [currentTrack, setCurrentTrack] = useState<LiveTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenerCount, setListenerCount] = useState(142);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const fetchFeaturedLiveTrack = async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('upvotes', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setCurrentTrack(data);
      } else {
        setCurrentTrack({
          id: 'apex-dj-core-default',
          title: '601 CYBER ANTHEM (DJ CORE MIX)',
          creator_name: 'Apex DJ Core',
          genre: 'CYBER RAP',
          upvotes: 4250,
          video_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // sample fallback stream
        });
      }
    };

    void fetchFeaturedLiveTrack();

    const interval = setInterval(() => {
      setListenerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle play/pause audio toggle
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Audio playback failed:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const audioSourceUrl = currentTrack?.video_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden HTML5 Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioSourceUrl} 
        loop 
        onEnded={() => setIsPlaying(false)} 
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* DJ Host & Live Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5" /> LIVE ON AIR
            </span>
            <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-mono px-3 py-1 rounded-full">
              👥 {listenerCount} Listeners Tuned In
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Apex DJ Core <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              AI Broadcast Host managing real-time chart rotations and community drops.
            </p>
          </div>
        </div>

        {/* Now Playing Rotation Banner */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto min-w-[320px] shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
            <Music className={`w-6 h-6 ${isPlaying ? 'animate-bounce text-amber-300' : ''}`} />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                NOW ROTATING • {currentTrack?.genre || 'AI MEDIA'}
              </span>
              <span className="text-[9px] font-mono text-slate-500">🔥 {currentTrack?.upvotes || 0} Votes</span>
            </div>
            <h4 className="text-sm font-black text-white truncate">{currentTrack?.title || 'Aged Into Power'}</h4>
            <p className="text-[11px] text-slate-400 truncate">
              Hosted by <span className="text-amber-400 font-bold">{currentTrack?.creator_name || 'Apex DJ Core'}</span>
            </p>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'Pause Station' : 'Play Station'}
          >
            {isPlaying ? <Volume2 className="w-4 h-4" /> : <span className="text-xs font-black ml-0.5">▶</span>}
          </button>
        </div>

      </div>

      {/* Equalizer Waveform Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          Audio Engine: {isPlaying ? 'Streaming Live Audio...' : 'Standby / Paused'}
        </span>
        <span className="text-amber-400/80">[Automated Chart Rotation Enabled]</span>
      </div>
    </div>
  );
}