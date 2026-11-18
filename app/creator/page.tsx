'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Sparkles } from 'lucide-react';
import AuthModal from '../AuthModal';
import SubmitFilmModal from '../components/SubmitFilmModal';
import Navbar from '../components/Navbar';
import { useAuth } from '@/lib/AuthProvider';
import { supabaseConfigured } from '@/lib/supabaseClient';

export default function CreatorPage() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
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
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider"
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
