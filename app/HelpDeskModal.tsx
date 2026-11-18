'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Send 
} from 'lucide-react';

export default function HelpDeskModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Ticket form states
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Billing & Stripe Tiers ($25 / $75)');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      q: "WHAT IS PROJECT-APEX?",
      a: "Project-Apex is an elite web-based AI film festival and virtual artist ecosystem. Creators can publish drops, compete in live battle arenas, climb global leaderboards, and utilize our AI Studio Prompt Generator."
    },
    {
      q: "HOW DOES THE $25 FEATURED SPOTLIGHT BOOST WORK?",
      a: "The $25 featured film boost via Stripe checkout instantly pins your drop to the homepage spotlight rotation and grants priority visibility across community feeds."
    },
    {
      q: "WHAT IS INCLUDED IN THE $75 PRO PASS?",
      a: "The $75/mo Pro Pass grants unlimited AI movie hosting, priority rendering infrastructure, high-speed streaming bandwidth, and automatic entry into all championship tournament brackets."
    },
    {
      q: "WHY ARE AI MOVIES RESTRICTED TO PAID TIERS ($25 / $75)?",
      a: "Long-form AI cinematic movies require dedicated rendering infrastructure, high-speed streaming bandwidth, and priority homepage spotlight pinning. Therefore, the Standard ($0) free tier is reserved for audio tracks, shorts, and community ballots, while AI Movies utilize our Featured Spotlight ($25) or Pro Pass ($75/mo) tiers."
    },
    {
      q: "HOW DO I DEPLOY A VIRTUAL DROP?",
      a: "Click 'Upload Drop' in the top header or studio hero button, enter your track details and genre (AI Movies require paid tiers), and publish directly to the live platform stream."
    },
    {
      q: "HOW DOES THE LEADERBOARD & BATTLE ARENA WORK?",
      a: "Creators enter head-to-head AI battles and accumulate upvotes from community voting rounds. The next major tournament bracket and voting window opens on January 1, 2027."
    },
    {
      q: "HOW DO I SAVE MY CREATOR PROFILE?",
      a: "In your Creator Dashboard, fill out your Virtual Artist Moniker and Home Region in the Creator Profile box, then click 'Save Identity' to securely persist your changes to the Supabase database."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMessage) return;
    setTicketSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header & Tabs */}
        <div className="space-y-4 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider">Project-Apex Help Desk & Pricing Guide</h3>
              <p className="text-[11px] text-slate-400">Explore platform rules, pricing tiers, or open a support ticket.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'faq'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Pricing & FAQs
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'ticket'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {activeTab === 'faq' ? (
            <div className="space-y-4">
              {/* Search Bar for FAQs */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search questions or pricing rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pricing Tiers Quick Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Standard Tier</span>
                  <div className="text-lg font-black text-white">$0 <span className="text-[10px] text-slate-500">Free</span></div>
                  <p className="text-[10px] text-slate-400">Audio tracks, shorts & community ballots.</p>
                </div>
                <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Popular</div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Featured Spotlight</span>
                  <div className="text-lg font-black text-white">$25 <span className="text-[10px] text-slate-500">/ drop</span></div>
                  <p className="text-[10px] text-slate-400">Instant homepage pinning & priority feed.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400">Pro Pass</span>
                  <div className="text-lg font-black text-white">$75 <span className="text-[10px] text-slate-500">/ mo</span></div>
                  <p className="text-[10px] text-slate-400">Unlimited AI movie hosting & tournament entry.</p>
                </div>
              </div>

              {/* Accordions */}
              <div className="space-y-3 pt-1">
                {filteredFaqs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No matching questions found.</p>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left font-black text-xs text-white uppercase tracking-wide hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div>
              {ticketSubmitted ? (
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Ticket Dispatched Successfully!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We've received your inquiry, <strong className="text-white">{ticketName}</strong>. Our support team will review and reply to <strong className="text-amber-400">{ticketEmail}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setTicketSubmitted(false); onClose(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer transition-all"
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
                      rows={4}
                      required
                      placeholder="Describe your issue or billing question in detail..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-4 h-4" /> Dispatch Support Ticket
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
