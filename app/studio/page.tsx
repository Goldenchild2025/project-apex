'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import SubmitFilmModal from '../components/SubmitFilmModal';
import AuthModal from '../AuthModal';
import { Sparkles, Copy, Check, Wand2, ArrowLeft, Film } from 'lucide-react';

export default function StudioPage() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [artist, setArtist] = useState('Jax Cypher');
  const [productionType, setProductionType] = useState('AI Movie Trailer / Cinematic');
  const [vibe, setVibe] = useState('Cinematic 4K, Anamorphic Lens, Dark Neo-Noir Grading');
  const [topic, setTopic] = useState('Transition corridor security breach in Jackson, MS');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const productionSpecs = productionType.includes('Movie')
    ? '[AI Video Spec: Sora 4K, 24fps, Cinematic Lighting, Hyper-Realistic Textures, Spatial Audio Mix]'
    : '[AI Audio Spec: Memphis Southern Rap, Heavy 808 Sub-Bass, Gritty Vocals, BPM 140]';

  function handleGeneratePrompt() {
    setGenerating(true);
    setTimeout(() => {
      const promptDraft = `(Cinematic Scene Setup)\nProject-Apex Global Feature Production.\nSubject: ${topic}.\nVisual Aesthetic: ${vibe}.\n\n(Storyboard Direction)\nShot 1: Wide anamorphic drone sweep over neon-lit capital corridors.\nShot 2: Close-up on ${artist} delivering high-impact neural verses.\nShot 3: Dynamic camera rotation with volumetric smoke and rain FX.\n\n${productionSpecs}`;
      
      setGeneratedLyrics(promptDraft);
      setGenerating(false);
    }, 800);
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(generatedLyrics + '\n\n' + productionSpecs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar onOpenSubmit={() => setIsSubmitOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI CINEMATIC & PROMPT STUDIO
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            SORA & UDIO SPEC GENERATOR
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Engineer custom AI movie scripts, cinematic storyboard tags, and high-fidelity audio specifications for your virtual artists.
          </p>
        </div>

        {/* Studio Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl h-fit">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" /> Prompt Parameters
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  PRODUCTION FORMAT
                </label>
                <select
                  value={productionType}
                  onChange={(e) => setProductionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="AI Movie Trailer / Cinematic">🎬 AI Movie Trailer / Short Film</option>
                  <option value="Rap Battle Anthem">🎤 Rap Battle Anthem (Udio/Suno)</option>
                  <option value="Music Video Visualizer">🎥 Music Video Visualizer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  LEAD VIRTUAL ARTIST
                </label>
                <select
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Jax Cypher">Jax Cypher (Jackson, MS)</option>
                  <option value="ByteRider">ByteRider (Atlanta, GA)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  CINEMATIC VIBE & LIGHTING
                </label>
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  SCENE CONCEPT / STORYLINE
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleGeneratePrompt}
                disabled={generating}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" /> {generating ? 'Engineering Prompt...' : 'Generate AI Spec'}
              </button>
            </div>
          </div>

          {/* Generated Output */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    OUTPUT SPECIFICATION • SORA & UDIO READY
                  </span>
                  <h3 className="text-xl font-black text-white">Generated Production Prompt</h3>
                </div>

                {generatedLyrics && (
                  <button
                    onClick={handleCopyPrompt}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Spec'}
                  </button>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed min-h-[280px]">
                {generatedLyrics || '// Click "Generate AI Spec" to build production-ready cinematic prompts and movie trailers.'}
              </div>
            </div>

            {generatedLyrics && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsSubmitOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Film className="w-4 h-4" /> Push AI Movie Drop to Submission Studio
                </button>
              </div>
            )}
          </div>

        </div>

      </main>

      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
