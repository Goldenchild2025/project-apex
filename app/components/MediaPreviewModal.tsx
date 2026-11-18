'use client';

import React from 'react';
import { X, Flame, Zap } from 'lucide-react';

interface MediaPreviewModalProps {
  film: {
    id: string;
    title: string;
    genre?: string;
    description?: string;
    video_url?: string;
    upvotes?: number;
    creator_name?: string;
    ai_model?: string;
  } | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
}

export default function MediaPreviewModal({ film, onClose, onUpvote }: MediaPreviewModalProps) {
  if (!film) return null;

  const isAudioFile = film.video_url?.match(/\.(mp3|wav|m4a|aac)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative space-y-6 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 pr-10">
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {film.genre || 'AI Media'}
          </span>
          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> {film.ai_model || 'Sora / Gen-3'}
          </span>
        </div>

        {/* Title & Creator */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{film.title}</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            Created by <span className="text-amber-400 font-bold">{film.creator_name || 'Apex Creator'}</span>
          </p>
        </div>

        {/* Media Player Container (Protected against right-click save and downloads) */}
        <div 
          className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 rounded-2xl overflow-hidden border border-amber-500/40 relative flex flex-col items-center justify-center p-6 text-center shadow-inner group select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {isAudioFile ? (
            <div className="w-full space-y-6 relative z-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Flame className="w-10 h-10 text-amber-400 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white tracking-wide uppercase">{film.title}</h3>
                <p className="text-[11px] text-amber-400 font-mono">[Apex Audio Stream Engine Active • Protected]</p>
              </div>
              <audio 
                src={film.video_url} 
                controls 
                autoPlay 
                controlsList="nodownload"
                className="w-full accent-amber-500"
              />
            </div>
          ) : film.video_url ? (
            <video 
              src={film.video_url} 
              controls 
              autoPlay 
              controlsList="nodownload"
              disablePictureInPicture
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent animate-pulse" />
              
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>
                <h3 className="text-sm font-black text-white tracking-widest uppercase">{film.title}</h3>
                <p className="text-[10px] text-amber-400/80 font-mono">[Secure 4K AI Stream • Audio Engine Active]</p>
              </div>

              {/* Equalizer Bars */}
              <div className="absolute bottom-4 flex items-end gap-1.5 h-6">
                <div className="w-1.5 bg-amber-400 rounded-t h-4 animate-pulse" />
                <div className="w-1.5 bg-amber-500 rounded-t h-6 animate-bounce" />
                <div className="w-1.5 bg-orange-400 rounded-t h-3 animate-pulse" />
                <div className="w-1.5 bg-amber-400 rounded-t h-5 animate-bounce" />
                <div className="w-1.5 bg-amber-300 rounded-t h-2 animate-pulse" />
              </div>
            </>
          )}

          <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-sm border border-amber-500/30 px-2.5 py-1 rounded text-[9px] font-mono text-amber-400 z-20">
            {isAudioFile ? 'SECURE MP3 AUDIO STREAM' : film.video_url ? 'SECURE VIDEO STREAM' : 'AI AUDIO STREAM PREVIEW'}
          </div>
        </div>

        {/* Prompt & Concept */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prompt & Concept</span>
          <p className="text-xs text-slate-300 leading-relaxed">{film.description || 'AI-generated media drop created with advanced neural synthesis.'}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onUpvote(film.id)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
          >
            <Flame className="w-4 h-4 fill-slate-950" /> Upvote Drop ({film.upvotes || 0})
          </button>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-4 py-2"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
