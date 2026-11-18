import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { filmId } = body;

    if (!filmId) {
      return NextResponse.json({ error: 'Missing filmId' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if vote already exists globally for this user and film
    const { data: existingVote } = await supabaseAdmin
      .from('film_votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('film_id', filmId)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this drop across the platform!' },
        { status: 400 }
      );
    }

    // 2. Insert vote into film_votes (enforces database uniqueness constraint)
    const { error: insertError } = await supabaseAdmin
      .from('film_votes')
      .insert({ user_id: user.id, film_id: filmId });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted for this drop!' },
          { status: 400 }
        );
      }
      throw insertError;
    }

    // 3. Fetch current upvotes and increment atomically
    const { data: filmData, error: fetchError } = await supabaseAdmin
      .from('films')
      .select('upvotes')
      .eq('id', filmId)
      .single();

    if (fetchError || !filmData) {
      return NextResponse.json({ error: 'Film drop not found' }, { status: 404 });
    }

    const newUpvotes = (filmData.upvotes || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from('films')
      .update({ upvotes: newUpvotes })
      .eq('id', filmId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, newUpvotes });
  } catch (err: any) {
    console.error('Vote API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}