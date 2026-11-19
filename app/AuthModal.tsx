'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';

  function switchMode(nextMode: 'signin' | 'signup' | 'forgot') {
    setMode(nextMode);
    setErrorMessage('');
    setSuccessMessage('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!supabaseConfigured) {
      setErrorMessage('Sign-in is unavailable until the Supabase settings are added to the project.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (isForgot) {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') ||
          window.location.origin;

        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${siteUrl}/auth/reset-password`,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Password reset link sent. Check your inbox and spam folder.');
        }
        return;
      }

      const result = isSignUp
        ? await supabase.auth.signUp({ email: trimmedEmail, password })
        : await supabase.auth.signInWithPassword({ email: trimmedEmail, password });

      if (result.error) {
        setErrorMessage(result.error.message);
      } else if (isSignUp && !result.data.session) {
        setSuccessMessage('Account created. Check your email to confirm it, then sign in.');
      } else {
        onClose();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete request. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {isForgot ? 'Reset Password' : isSignUp ? 'Join Project-Apex' : 'Sign In to Apex'}
          </h2>
          <p className="text-xs text-slate-400">
            {isForgot
              ? 'Enter your account email and we will send a recovery link'
              : isSignUp
              ? 'Create your virtual artist account & deploy drops'
              : 'Enter credentials to access your studio & dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="off"
                data-lpignore="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field (Hidden in Forgot Password mode) */}
          {!isForgot && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  data-lpignore="true"
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
          )}

          {errorMessage && <p role="alert" className="text-xs text-rose-300">{errorMessage}</p>}
          {successMessage && <p role="status" className="text-xs text-emerald-300">{successMessage}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading
              ? isForgot
                ? 'Sending Reset Link...'
                : 'Authenticating...'
              : isForgot
              ? 'Send Reset Link'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center">
          {isForgot ? (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer font-medium"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
