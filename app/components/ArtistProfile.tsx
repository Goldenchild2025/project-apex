'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trophy, Flame, Play, Shield, Vote, Music, Video } from 'lucide-react';

export interface Artist {
  id: string;
  name: string;
  tagline: string;
  genre: string;
  location: string;
  rank: string;
  record: { wins: number; losses: number; knockouts: number };
  totalStreams: string;
  upvotes: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
}

interface ArtistProfileProps {
  artist: Artist;
}

export default function ArtistProfile({ artist }: ArtistProfileProps) {
  const [activeTab, setActiveTab] = useState<'battles' | 'videos' | 'audio'>('battles');
  const [votes, setVotes] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* 1. Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <Image
          src={artist.bannerUrl} 
          alt={`${artist.name} Banner`} 
            fill
            sizes="100vw"
            unoptimized
          className="w-full h-full object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* 2. Profile Header Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Avatar Image */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-cyan-500/20 shadow-lg shrink-0">
            <Image src={artist.avatarUrl} alt={artist.name} fill sizes="(max-width: 768px) 144px, 176px" unoptimized className="object-cover" />
            <span className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              UNDEFEATED
            </span>
          </div>

          {/* Artist Bio & Meta Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> {artist.rank}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                {artist.genre}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">{artist.name}</h1>
            <p className="text-cyan-400 font-mono text-sm italic mt-1">&ldquo;{artist.tagline}&rdquo;</p>
            <p className="text-slate-400 text-sm mt-3 max-w-2xl">{artist.bio}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
            <button 
              onClick={() => setVotes(votes + 1)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Vote className="w-4 h-4" /> Vote for Next Match ({votes})
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer">
              <Flame className="w-4 h-4 text-amber-400" /> Challenge Artist
            </button>
          </div>
        </div>

        {/* 3. Key Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Battle Record</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{artist.record.wins}W - {artist.record.losses}L</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Knockouts</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">{artist.record.knockouts} KOs</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Apex Streams</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{artist.totalStreams}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fan Rating</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{artist.upvotes}</p>
          </div>
        </div>

        {/* 4. Interactive Tabs & Content Feed */}
        <div className="mt-10">
          <div className="flex border-b border-slate-800 gap-8 mb-6">
            <button 
              onClick={() => setActiveTab('battles')}
              className={`pb-3 font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'battles' 
                  ? 'border-b-2 border-cyan-500 text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" /> Battle Replays
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'videos' 
                  ? 'border-b-2 border-cyan-500 text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" /> Music Videos
            </button>
            <button 
              onClick={() => setActiveTab('audio')}
              className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'audio' 
                  ? 'border-b-2 border-cyan-500 text-cyan-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-4 h-4" /> Audio Tracks
            </button>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer"
              >
                <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform border border-cyan-500/40">
                    <Play className="w-6 h-6 text-cyan-400 fill-cyan-400 ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-950/80 text-xs px-2 py-0.5 rounded text-slate-300 font-mono">
                    03:15
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-wide">
                    {activeTab === 'battles' ? `Apex Rap Battle #0${item}` : `Official Release #0${item}`}
                  </span>
                  <h3 className="font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                    Jax Cypher vs. Rival_AI (Round {item})
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">12.4K Votes • 94% Fan Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
