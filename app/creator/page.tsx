'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Crown,
  ExternalLink,
  Play,
  Film,
  Flame,
} from 'lucide-react';
import AuthModal from '../AuthModal';
import SubmitFilmModal from '../components/SubmitFilmModal';
import MediaPreviewModal from '../components/MediaPreviewModal';
import Navbar from '../components/Navbar';
import { useAuth } from '@/lib/AuthProvider';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

interface CreatorLink {
  label: string;
  url: string;
}

interface CreatorProfile {
  id: string;
  moniker?: string | null;
  bio?: string | null;
  subscription_tier?: string | null;
  links?: CreatorLink[] | null;
}

interface CreatorDrop {
  id: string;
  user_id?: string;
  title: string;
  creator_name?: string;
  artist_name?: string;
  genre: string;
  upvotes: number;
  artwork_url?: string;
  video_url?: string;
  is_featured?: boolean;
}

function normalizeDrops(rows: any[] | null): CreatorDrop[] {
  return (rows ?? []).map((row) => ({
    ...row,
    artwork_url: row.artwork_url ?? undefined,
    video_url: row.video_url ?? undefined,
  }));
}

function CreatorContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('id')?.trim() || '';
  const targetName = searchParams.get('name')?.trim() || '';

  const isPublicProfileView = Boolean(targetUserId || targetName);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<CreatorDrop | null>(null);

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [drops, setDrops] = useState<CreatorDrop[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isPublicProfileView || !supabaseConfigured) return;

    let active = true;
    setProfileLoading(true);

    async function loadCreatorHub() {
      let resolvedProfile: CreatorProfile | null = null;
      let resolvedDrops: CreatorDrop[] = [];

      if (targetUserId) {
        const [{ data: profileData }, { data: dropsData }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, moniker, bio, subscription_tier, links')
            .eq('id', targetUserId)
            .maybeSingle(),
          supabase
            .from('films')
            .select('*')
            .eq('user_id', targetUserId)
            .order('upvotes', { ascending: false }),
        ]);

        resolvedProfile = profileData ?? null;
        resolvedDrops = normalizeDrops(dropsData);
      } else if (targetName) {
        const [{ data: profileData }, { data: dropsData }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, moniker, bio, subscription_tier, links')
            .ilike('moniker', targetName)
            .maybeSingle(),
          supabase
            .from('films')
            .select('*')
            .ilike('creator_name', targetName)
            .order('upvotes', { ascending: false }),
        ]);

        resolvedProfile = profileData ?? null;
        resolvedDrops = normalizeDrops(dropsData);
      }

      if (!active) return;
      setProfile(resolvedProfile);
      setDrops(resolvedDrops);
      setProfileLoading(false);
    }

    void loadCreatorHub();

    return () => {
      active = false;
    };
  }, [isPublicProfileView, targetUserId, targetName]);

  // Public Creator Profile Hub View (/creator?id=... or /creator?name=...)
  if (isPublicProfileView) {
    const displayName =
      profile?.moniker?.trim() ||
      targetName ||
      drops[0]?.creator_name ||
      drops[0]?.artist_name ||
      'Apex Creator';
    const tier = profile?.subscription_tier || 'free';
    const links = Array.isArray(profile?.links)
      ? profile.links.filter((l) => l?.label && l?.url)
      : [];
    const totalUpvotes = drops.reduce((sum, item) => sum + (item.upvotes || 0), 0);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pt-14">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} onOpenSubmit={() => setIsSubmitOpen(true)} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>

          {/* Creator Profile Header */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  {tier === 'pro' ? (
                    <>
                      <Crown className="w-3.5 h-3.5" /> Pro Pass Creator
                    </>
                  ) : tier === 'featured' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Featured Creator
                    </>
                  ) : (
                    'Virtual Artist Hub'
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                  {displayName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {profile?.bio?.trim() ||
                    `Official Project-Apex catalog and external channels for ${displayName}.`}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                  <span className="block text-lg font-black text-white">{drops.length}</span>
                  <span className="text-[9px] font-mono uppercase text-slate-400">Drops</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center">
                  <span className="block text-lg font-black text-amber-400">{totalUpvotes}</span>
                  <span className="text-[9px] font-mono uppercase text-slate-400">Total Votes</span>
                </div>
              </div>
            </div>

            {/* External Content Links (Monetized via /out for free tier, direct for paid tiers) */}
            {links.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Official External Channels & Content
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {links.map((link, idx) => {
                    const isPaidCreator = tier === 'featured' || tier === 'pro';
                    const href = isPaidCreator
                      ? link.url
                      : `/out?url=${encodeURIComponent(link.url)}&label=${encodeURIComponent(
                          link.label
                        )}&creator=${encodeURIComponent(displayName)}`;

                    return (
                      <Link
                        key={`${link.label}-${idx}`}
                        href={href}
                        target={isPaidCreator ? '_blank' : undefined}
                        rel={isPaidCreator ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                      >
                        {link.label}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Creator's Drops Grid (100% Ad-Free) */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" /> Drops by {displayName}
            </h2>

            {profileLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-xs font-mono text-slate-400">
                Loading creator catalog...
              </div>
            ) : drops.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <p className="text-xs text-slate-400">No published drops found for this creator yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {drops.map((drop) => (
                  <div
                    key={drop.id}
                    onClick={() => setSelectedFilm(drop)}
                    className="bg-slate-900 hover:border-amber-500/40 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
                  >
                    <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {drop.artwork_url ? (
                        <img
                          src={drop.artwork_url}
                          alt={drop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Play className="w-8 h-8 text-amber-400" />
                      )}
                      <span className="absolute top-3 left-3 bg-slate-950/85 border border-slate-800 text-[9px] font-mono font-bold text-amber-400 px-2.5 py-1 rounded-full uppercase">
                        {drop.genre}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-black text-white truncate group-hover:text-amber-400 transition-colors">
                        {drop.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5" /> {drop.upvotes || 0} votes
                        </span>
                        <span className="text-cyan-400 uppercase font-bold">Play Drop →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {selectedFilm && (
          <MediaPreviewModal
            film={selectedFilm}
            onClose={() => setSelectedFilm(null)}
            onUpvote={async () => {}}
          />
        )}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      </div>
    );
  }

  // Default /creator Studio Deployment View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pt-14">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} onOpenSubmit={() => setIsSubmitOpen(true)} />
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Virtual Artist Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Deploy a New Drop</h1>
            <p className="text-sm text-slate-400">Publish an AI-generated track or video to the Project Apex community grid.</p>
          </div>

          {loading ? (
            <p role="status" className="text-sm text-slate-400">Checking your account…</p>
          ) : user ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Signed in as <span className="text-amber-400">{user.email}</span></p>
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Open Submission Form
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                {supabaseConfigured
                  ? 'Sign in or create an account before submitting a drop.'
                  : 'Add the Supabase settings to enable creator accounts and submissions.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Sign In / Create Account
              </button>
            </div>
          )}
        </section>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SubmitFilmModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
}

export default function CreatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">
          Loading Creator Profile...
        </div>
      }
    >
      <CreatorContent />
    </Suspense>
  );
}
