'use client';

import React from 'react';
import { Flame, Play, Trophy } from 'lucide-react';

type Film = {
  id: string;
  title: string;
  creator_name?: string;
  genre?: string;
  upvotes?: number;
  artwork_url?: string;
  video_url?: string;
  is_featured?: boolean;
};

interface FilmGridProps {
  films: Film[];
  onSelectFilm: (film: Film) => void;
  onUpvote: (id: string) => void;
}

export default function FilmGrid({ films, onSelectFilm, onUpvote }: FilmGridProps) {
  if (films.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <p className="text-xs text-slate-400">No media drops found in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {films.map((film) => (
        <div
          key={film.id}
          onClick={() => onSelectFilm(film)}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          {/* Card Thumbnail / Preview Banner */}
          <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 relative flex items-center justify-center overflow-hidden">
            {film.artwork_url ? (
              <img src={film.artwork_url} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
            )}

            {/* Direct Thumbnail Play Trigger Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectFilm(film);
              }}
              className="absolute z-10 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-all cursor-pointer"
              title="Play Drop Preview"
            >
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            </button>

            {film.is_featured && (
              <span className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider z-20 shadow-md">
                Featured Spotlight
              </span>
            )}

            <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-amber-400 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider z-20">
              {film.genre || 'AI Media'}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white truncate group-hover:text-amber-400 transition-colors">
                {film.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Created by <span className="text-slate-200 font-bold">{film.creator_name || 'Apex Creator'}</span>
              </p>
            </div>

            {/* Footer Upvote Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(film.id);
                }}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {film.upvotes || 0}
              </button>

              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Instant Preview
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
