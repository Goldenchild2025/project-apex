'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!supabaseConfigured) {
      setErrorMessage('Password reset is unavailable until Supabase is configured.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Password updated! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-slate-400">
            Choose a new password (8+ characters) for your Project-Apex account
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {errorMessage && <p role="alert" className="text-xs text-rose-300">{errorMessage}</p>}
          {successMessage && <p role="status" className="text-xs text-emerald-300">{successMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </Link>
        </div>
      </div>
    </main>
  );
}