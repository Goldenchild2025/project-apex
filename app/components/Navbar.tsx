'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Film,
  Trophy,
  Crown,
  Sparkles,
  LayoutDashboard,
  Upload,
  LogOut,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenSubmit, onOpenAuth }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (supabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  // Authentication guard for uploading drops
  const handleUploadClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      onOpenSubmit();
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-9 left-0 right-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Film className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-wider text-white uppercase">
            PROJECT-<span className="text-amber-400">APEX</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          <Link
            href="/"
            className={`transition-all py-1 px-2 rounded-lg ${isActive('/') ? 'text-amber-400 bg-amber-500/10 font-black' : 'hover:text-amber-400'}`}
          >
            Explore
          </Link>
          <Link
            href="/battles"
            className={`transition-all py-1 px-2 rounded-lg flex items-center gap-1.5 ${isActive('/battles') ? 'text-amber-400 bg-amber-500/10 font-black' : 'hover:text-amber-400'}`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Battle Arena
          </Link>
          <Link
            href="/leaderboard"
            className={`transition-all py-1 px-2 rounded-lg flex items-center gap-1.5 ${isActive('/leaderboard') ? 'text-amber-400 bg-amber-500/10 font-black' : 'hover:text-amber-400'}`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
          </Link>
          <Link
            href="/awards"
            className={`transition-all py-1 px-2 rounded-lg flex items-center gap-1.5 ${isActive('/awards') ? 'text-amber-400 bg-amber-500/10 font-black' : 'hover:text-amber-400'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Awards
          </Link>
          <Link
            href="/dashboard"
            className={`transition-all py-1 px-2 rounded-lg flex items-center gap-1.5 ${isActive('/dashboard') ? 'text-amber-400 bg-amber-500/10 font-black' : 'hover:text-amber-400'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" /> Dashboard
          </Link>

          <button
            onClick={handleUploadClick}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-black shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Drop
          </button>
        </nav>

        {/* Upgraded Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800/80 px-3.5 py-1.5 rounded-2xl shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-300 truncate max-w-[130px] font-medium">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border border-rose-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In / Register
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-5 space-y-3 shadow-2xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-wider text-slate-200 hover:text-amber-400 py-1.5"
          >
            Explore
          </Link>
          <Link
            href="/battles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-wider text-slate-200 hover:text-amber-400 py-1.5"
          >
            Battle Arena
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-wider text-slate-200 hover:text-amber-400 py-1.5"
          >
            Leaderboard
          </Link>
          <Link
            href="/awards"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-wider text-slate-200 hover:text-amber-400 py-1.5"
          >
            Awards
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-black uppercase tracking-wider text-slate-200 hover:text-amber-400 py-1.5"
          >
            Dashboard
          </Link>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleUploadClick();
              }}
              className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/30 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Drop
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border border-rose-500/30 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({user.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <LogIn className="w-4 h-4" /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}