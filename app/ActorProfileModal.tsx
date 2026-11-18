'use client';

import React from 'react';
import { X, Flame, Sparkles, Film, UserCheck } from 'lucide-react';

interface FilmographyItem {
  id: string;
  title: string;
  genre: string;
  votes?: number;
}

interface Actor {
  name: string;
  origin?: string;
  style?: string;
  ai_models?: string;
  bio?: string;
  total_upvotes?: number;
  filmography?: FilmographyItem[];
}

interface ActorProfileModalProps {
  actor: Actor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActorProfileModal({ actor, isOpen, onClose }: ActorProfileModalProps) {
  if (!isOpen || !actor) return null;

  // Custom drops per artist initialized to 0 votes
  const defaultReleases =
    actor.name === 'Jax Cypher'
      ? [
          { id: '1', title: '601 Anthem (Sora 4K)', genre: 'SOUTHERN RAP', votes: 0 },
          { id: '2', title: 'Jackson Cypher Vol. 1', genre: 'RAP BATTLE', votes: 0 },
        ]
      : actor.name === 'ByteRider'
      ? [
          { id: '3', title: 'Cyberpunk Anthem X', genre: 'CYBERPUNK HIP-HOP', votes: 0 },
          { id: '4', title: 'Gridlock Protocol', genre: 'RAP BATTLE', votes: 0 },
        ]
      : [
          { id: '5', title: 'Featured Media Drop', genre: 'AI MEDIA', votes: 0 },
        ];

  const releases = actor.filmography && actor.filmography.length > 0 ? actor.filmography : defaultReleases;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative space-y-6 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Actor Header Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            {actor.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-amber-400" /> Virtual Artist / AI Actor
              </span>
              <span className="text-slate-500 text-[10px] font-mono">
                {actor.origin || 'Jackson, MS'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{actor.name}</h2>
            <p className="text-xs text-slate-400">{actor.style || 'Southern Trap / Battle Specialist'}</p>
          </div>
        </div>

        {/* AI Stack & Bio */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Generative AI Stack
          </span>
          <p className="text-xs text-amber-300 font-mono">
            {actor.ai_models || 'Sora AI • Runway Gen-3 • Udio • ElevenLabs'}
          </p>
          <p className="text-xs text-slate-400 pt-1 leading-relaxed">
            {actor.bio || 'Autonomous AI virtual actor designed for high-impact hip-hop drops, short films, and live arena battles.'}
          </p>
        </div>

        {/* Filmography & Drops */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-4 h-4 text-amber-400" /> Featured Releases
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {releases.map((drop) => (
              <div key={drop.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs hover:border-amber-500/30 transition-colors">
                <div>
                  <span className="block font-bold text-white">{drop.title}</span>
                  <span className="text-[10px] text-amber-400/80 uppercase font-mono">{drop.genre}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {drop.votes || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Action */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all border border-slate-700 cursor-pointer"
        >
          Close Profile
        </button>

      </div>
    </div>
  );
}