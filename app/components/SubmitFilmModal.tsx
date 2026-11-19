'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, supabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';
import { X, Sparkles, Crown, Shield, Zap, Loader2, AlertTriangle } from 'lucide-react';

const PROJECT_APEX_GENRES = [
  'Cyber Rap',
  'Southern Hip-Hop / Southern Rap',
  'Southern AI Trap / 601 Sound',
  'Cyber Cinematic / AI Film',
  'Phonk & Dark Trap',
  'Esoteric / Spiritual Lofi',
  'Hyperpop & Glitchcore',
  'Synthwave',
  'AI Movies', // Restricted to Paid Tiers ($25 / $75)
  'Short Films',
  'AI TV Shows',
  'Episodic Series',
  'Animated Episodes',
] as const;

interface SubmitFilmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitFilmModal({ isOpen, onClose }: SubmitFilmModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'featured' | 'pro'>('free');
  const [genre, setGenre] = useState<string>(PROJECT_APEX_GENRES[0]);
  const [contentRating, setContentRating] = useState('General');
  const [description, setDescription] = useState('');

  // File upload states
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    // STRICT GUARD: Prevent Free Tier users from publishing AI Movies
    if (selectedTier === 'free' && genre === 'AI Movies') {
      setErrorMessage('🔒 AI Movies require the Featured Spotlight ($25/drop) or Pro Pass ($75/mo) tier.');
      return;
    }

    if (!supabaseConfigured) {
      setErrorMessage('Supabase is not configured.');
      return;
    }

    setLoading(true);

    try {
      // 1. Refresh & verify session token and active user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const activeUser = session?.user || user;
      if (!activeUser) {
        setErrorMessage('Session expired or unauthorized. Please sign out and sign back in.');
        setLoading(false);
        return;
      }

      const accessToken = session?.access_token || '';

      setUploadingFile(true);
      let finalMediaUrl = '';
      let finalArtworkUrl = '';

      // 2. Upload Media File (Audio/Video)
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('apex-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw new Error(`Media upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('apex-media')
          .getPublicUrl(fileName);

        finalMediaUrl = publicUrlData.publicUrl;
      }

      // 3. Upload Album Artwork Image
      if (artworkFile) {
        const artExt = artworkFile.name.split('.').pop();
        const artName = `art-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${artExt}`;

        const { error: artUploadError } = await supabase.storage
          .from('apex-media')
          .upload(artName, artworkFile);

        if (artUploadError) throw new Error(`Artwork upload failed: ${artUploadError.message}`);

        const { data: artUrlData } = supabase.storage
          .from('apex-media')
          .getPublicUrl(artName);

        finalArtworkUrl = artUrlData.publicUrl;
      }

      setUploadingFile(false);

      // 4. Submit drop payload to API with Auth Bearer token and explicit userId
      const res = await fetch('/api/submit-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          artistName: artistName || 'King Ducko',
          genre,
          contentRating,
          description,
          selectedTier,
          videoUrl: finalMediaUrl,
          artworkUrl: finalArtworkUrl,
          userId: activeUser.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit drop.');
      }

      const filmId = result.filmId;

      // 5. Handle Stripe Checkout Redirection for Paid Tiers
      if (selectedTier !== 'free' && filmId) {
        const checkoutRes = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            filmId: String(filmId),
            tier: selectedTier,
            userId: activeUser.id,
            email: activeUser.email,
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (!checkoutRes.ok) {
          throw new Error(checkoutData.error || 'Failed to create Stripe checkout session.');
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      window.dispatchEvent(new Event('apex-film-added'));
      router.push('/dashboard');
      onClose();
    } catch (err: any) {
      console.error('Submission Catch Error:', err);
      setErrorMessage(err?.message || 'Publishing failed. Check console for details.');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            PUBLISH AI DROP & ARTWORK
          </h2>
          <p className="text-xs text-slate-400">
            Upload your audio/video file, attach custom album cover art, and publish.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TITLE</label>
            <input
              type="text"
              required
              placeholder="e.g. 601 Cyber Anthem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ARTIST / MONIKER</label>
            <input
              type="text"
              required
              placeholder="e.g. Shon Da Don"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">GENRE CATEGORY</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 uppercase font-bold cursor-pointer"
              >
                {PROJECT_APEX_GENRES.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white py-2">
                    {g} {g === 'AI Movies' ? '⭐ [Paid Tier Only]' : ''}
                  </option>
                ))}
              </select>
              {genre === 'AI Movies' && selectedTier === 'free' && (
                <p className="text-[10px] text-amber-400 flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> AI Movies require Featured ($25) or Pro Pass ($75).
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CONTENT RATING</label>
              <select
                value={contentRating}
                onChange={(e) => setContentRating(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="General" className="bg-slate-900 text-white py-2">General (All Audiences)</option>
                <option value="Teen" className="bg-slate-900 text-white py-2">Teen (T)</option>
                <option value="Explicit / Mature" className="bg-slate-900 text-white py-2">Explicit / Mature (18+)</option>
              </select>
            </div>
          </div>

          {/* Media File Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">UPLOAD MEDIA FILE (AUDIO/VIDEO)</label>
            <div className="border border-dashed border-slate-800 bg-slate-950 rounded-xl p-4 text-center space-y-2 hover:border-amber-500/50 transition-colors">
              <input
                type="file"
                id="media-file-input"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
              {mediaFile && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl mt-2">
                  <p className="text-[11px] text-emerald-400 font-bold truncate">Selected: {mediaFile.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      const input = document.getElementById('media-file-input') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer ml-2 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Album Artwork Image Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">UPLOAD ALBUM ARTWORK (JPG, PNG)</label>
            <div className="border border-dashed border-slate-800 bg-slate-950 rounded-xl p-4 text-center space-y-2 hover:border-cyan-500/50 transition-colors">
              <input
                type="file"
                id="artwork-file-input"
                accept="image/*"
                onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
              />
              {artworkFile && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl mt-2">
                  <p className="text-[11px] text-cyan-400 font-bold truncate">Selected: {artworkFile.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setArtworkFile(null);
                      const input = document.getElementById('artwork-file-input') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer ml-2 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DESCRIPTION / PROMPT NOTES (OPTIONAL)</label>
            <textarea
              rows={2}
              placeholder="Briefly describe your concept, prompt setup, or vision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SELECT TIER</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setSelectedTier('free')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all space-y-2 ${selectedTier === 'free' ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30' : 'border-slate-800 bg-slate-950'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase">Standard</span>
                  <Zap className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-lg font-black text-amber-400">$0</div>
                <p className="text-[10px] text-slate-400">Audio tracks, shorts & community ballots.</p>
              </div>

              <div
                onClick={() => setSelectedTier('featured')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all space-y-2 ${selectedTier === 'featured' ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30' : 'border-slate-800 bg-slate-950'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase">Featured</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-black text-amber-400">$25<span className="text-[10px] text-slate-400">/drop</span></div>
                <p className="text-[10px] text-slate-400">Top homepage spotlight pinning & AI movies.</p>
              </div>

              <div
                onClick={() => setSelectedTier('pro')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all space-y-2 ${selectedTier === 'pro' ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30' : 'border-slate-800 bg-slate-950'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase">Pro Pass</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-lg font-black text-cyan-400">$75<span className="text-[10px] text-slate-400">/mo</span></div>
                <p className="text-[10px] text-slate-400">Priority AI studio, movies & awards bracket.</p>
              </div>
            </div>
          </div>

          {errorMessage && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl font-bold">{errorMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {uploadingFile ? (
              <>Uploading files to storage...</>
            ) : loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing Drop...</>
            ) : selectedTier === 'free' ? (
              'Publish Free Drop'
            ) : (
              `Proceed to Stripe (${selectedTier === 'pro' ? '$75/mo' : '$25 boost'})`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}