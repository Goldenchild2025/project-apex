'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
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

  if (!isOpen) return null;

  // Filter films belonging strictly to the logged-in creator
  const myFilms = user ? films.filter((f) => f.user_id === user.id) : [];

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
            <p className="text-xs text-zinc-400">Manage your submissions and boost films to the Featured Spotlight ($25/mo)</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition">
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
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition"
            >
              Close & Sign In via Header
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {errorMessage && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">{errorMessage}</p>}
            <div className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/80 p-4 rounded-xl">
              <div>
                <p className="text-xs text-zinc-400">Signed in as creator:</p>
                <p className="text-sm font-mono text-white">{user.email}</p>
              </div>
              <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold">
                Active Creator Session
              </span>
            </div>

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
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-xs transition shadow-md shadow-amber-500/20"
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
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
