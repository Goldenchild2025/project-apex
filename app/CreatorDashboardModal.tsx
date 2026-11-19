'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { ExternalLink, Plus, Trash2, Check } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

export interface Film {
  id: string;
  title: string;
  description?: string;
  is_featured: boolean;
  created_at?: string;
  user_id?: string;
  video_url?: string;
}

interface CreatorLink {
  label: string;
  url: string;
}

interface CreatorDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  films: Film[];
}

export default function CreatorDashboardModal({ isOpen, onClose, films }: CreatorDashboardModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(supabaseConfigured);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Public Creator Profile Hub fields
  const [moniker, setMoniker] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabaseConfigured || !user || !isOpen) return;

    let active = true;
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('moniker, bio, links')
        .eq('id', user!.id)
        .maybeSingle();

      if (!active || !data) return;
      setMoniker(data.moniker || user!.email?.split('@')[0] || '');
      setBio(data.bio || '');
      setLinks(Array.isArray(data.links) ? data.links : []);
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user, isOpen]);

  if (!isOpen) return null;

  const myFilms = user ? films.filter((f) => f.user_id === user.id) : [];

  const handleAddLink = () => {
    const cleanLabel = newLinkLabel.trim();
    const cleanUrl = newLinkUrl.trim();
    if (!cleanLabel || !cleanUrl) return;
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      setErrorMessage('External links must start with https:// or http://');
      return;
    }
    setErrorMessage('');
    setLinks((prev) => [...prev, { label: cleanLabel, url: cleanUrl }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabaseConfigured) return;

    setSavingProfile(true);
    setProfileSaved(false);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            moniker: moniker.trim() || user.email?.split('@')[0] || 'Apex Creator',
            bio: bio.trim(),
            links,
          },
          { onConflict: 'id' }
        );

      if (error) throw error;
      setProfileSaved(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save creator profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBoost = async (filmId: string) => {
    try {
      setProcessingId(filmId);
      setErrorMessage('');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setErrorMessage('Your sign-in session expired. Sign in again to continue.');
        return;
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ filmId }),
      });

      const data: { url?: string; error?: string } = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setErrorMessage(data.error || 'Failed to initiate checkout.');
      }
    } catch (error) {
      console.error('Checkout error:', error instanceof Error ? error.message : 'Unknown error');
      setErrorMessage('An error occurred during checkout. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Creator Portal & Monetization</h3>
            <p className="text-xs text-zinc-400">Manage your public profile links, submissions, and Featured Spotlight boosts ($25/mo)</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
            ✕
          </button>
        </div>

        {loadingUser ? (
          <div className="text-center py-12 text-zinc-500 text-xs">Authenticating creator session...</div>
        ) : !user ? (
          <div className="text-center py-12 space-y-3 bg-zinc-950/60 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-300 text-sm font-semibold">Sign In Required</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {supabaseConfigured
                ? 'Sign in as a creator to view your uploaded films, manage submissions, and activate feature boosts.'
                : 'Add the Supabase settings to the project to enable creator sign-in and film boosts.'}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Close & Sign In via Header
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {errorMessage && (
              <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 p-4 rounded-xl">
              <div>
                <p className="text-xs text-zinc-400">Signed in as creator:</p>
                <p className="text-sm font-mono text-white">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/creator?id=${encodeURIComponent(user.id)}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition"
                >
                  View Public Hub <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold">
                  Active Session
                </span>
              </div>
            </div>

            {/* Public Profile Bio & External Content Links */}
            <form onSubmit={handleSaveProfile} className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Public Profile & External Links</h4>
                {profileSaved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Profile Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Artist Moniker</label>
                  <input
                    type="text"
                    value={moniker}
                    onChange={(e) => setMoniker(e.target.value)}
                    placeholder="e.g. King Ducko"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Bio</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="AI tracks, series, and virtual visuals"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400">External Content Links</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    placeholder="Link label (e.g. YouTube / Catalog)"
                    className="sm:w-1/3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>

                {links.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {links.map((item, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-amber-400">{item.label}</span>
                          <span className="text-zinc-500 mx-2">•</span>
                          <span className="text-zinc-300 font-mono text-[11px]">{item.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="text-zinc-400 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Creator Profile'}
                </button>
              </div>
            </form>

            {/* Uploaded Films & Featured Boosts */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Your Uploaded Films ({myFilms.length})</h4>

              {myFilms.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl space-y-2">
                  <p className="text-zinc-400 text-xs">You have not uploaded any films yet.</p>
                  <p className="text-[11px] text-zinc-500">Use “Submit Film” on the main page to publish your first AI film.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myFilms.map((film) => (
                    <div
                      key={film.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-sm">{film.title}</h5>
                          {film.is_featured && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">
                              ★ Featured Spotlight Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{film.description || 'No description'}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {film.is_featured ? (
                          <span className="px-3 py-2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                            Boosted ($25/mo Paid)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBoost(film.id)}
                            disabled={processingId === film.id}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            {processingId === film.id ? 'Connecting...' : 'Boost to Featured ($25/mo)'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
