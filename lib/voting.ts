import { supabase } from './supabaseClient';

export async function handleVote(filmId: string | number, currentUpvotes: number) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'anonymous';

    // Optional: Check if user already voted for this film in local storage or a votes table to prevent spam
    const voteKey = `apex_voted_${filmId}_${userId}`;
    if (localStorage.getItem(voteKey)) {
      return { success: false, message: 'You have already voted for this drop!' };
    }

    const newUpvotes = (Number(currentUpvotes) || 0) + 1;

    const { error } = await supabase
      .from('films')
      .update({ upvotes: newUpvotes })
      .eq('id', filmId);

    if (error) throw error;

    localStorage.setItem(voteKey, 'true');
    return { success: true, newUpvotes };
  } catch (err: any) {
    console.error('Vote error:', err);
    return { success: false, message: err.message || 'Failed to register vote.' };
  }
}