'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabaseClient';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportTicketModal({ isOpen, onClose }: SupportTicketModalProps) {
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Billing & Stripe Tiers ($25 / $75)');
  const [ticketMessage, setTicketMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!ticketName || !ticketEmail || !ticketMessage) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!supabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: session?.user?.id || null,
          name: ticketName.trim(),
          email: ticketEmail.trim(),
          category: ticketCategory,
          message: ticketMessage.trim(),
        });

      if (error) throw error;

      setTicketSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <button 
          onClick={() => { onClose(); setTicketSubmitted(false); }} 
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-black uppercase text-white tracking-wider">Project-Apex Help Desk</h3>
        </div>

        {errorMsg && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold">{errorMsg}</div>}

        {ticketSubmitted ? (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black text-white uppercase">Ticket Logged in Database!</h4>
            <p className="text-xs text-slate-400">
              Thank you, <strong className="text-white">{ticketName}</strong>. Our engineering team has received your ticket and will reply at <strong className="text-amber-400">{ticketEmail}</strong>.
            </p>
            <button
              onClick={() => { onClose(); setTicketSubmitted(false); }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Your Name / Moniker</label>
                <input
                  type="text"
                  required
                  placeholder="Jax Cypher"
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="creator@projectapex.ai"
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Inquiry Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Billing & Stripe Tiers ($25 / $75)">Billing & Stripe Tiers ($25 / $75)</option>
                <option value="AI Movie Submission Rules">AI Movie Submission Rules</option>
                <option value="Leaderboard & Battle Arena">Leaderboard & Battle Arena</option>
                <option value="Supabase Profile & Account">Supabase Profile & Account</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your issue..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" /> {loading ? 'Submitting Ticket...' : 'Send Ticket'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}