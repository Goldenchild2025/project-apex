'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { supabaseConfigured } from '@/lib/supabaseClient';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  filmId: string;
  onOpenAuth?: () => void;
}

interface CommentRecord {
  id: string;
  film_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function CommentSection({ filmId, onOpenAuth }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(supabaseConfigured);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!filmId || !supabaseConfigured) return;
    let active = true;
    void supabase
      .from('comments')
      .select('id, film_id, user_id, content, created_at')
      .eq('film_id', filmId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Error fetching comments:', error.message);
        setComments((data ?? []) as CommentRecord[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, [filmId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        if (onOpenAuth) onOpenAuth();
        return;
      }

      const commentData = {
        film_id: filmId,
        user_id: userData.user.id,
        content: newComment.trim(),
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

      if (!error && data) {
        setComments((current) => [data as CommentRecord, ...current]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-amber-400" /> Community Discussion ({comments.length})
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share feedback or prompt ideas..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Post
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Loading feedback...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          No comments yet. Be the first to share prompt feedback!
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> Community Member
                </span>
                <span className="text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
