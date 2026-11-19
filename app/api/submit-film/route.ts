import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_GENRES = new Set([
  'Cyber Rap',
  'Southern Hip-Hop / Southern Rap',
  'Southern AI Trap / 601 Sound',
  'Cyber Cinematic / AI Film',
  'Phonk & Dark Trap',
  'Esoteric / Spiritual Lofi',
  'Hyperpop & Glitchcore',
  'Synthwave',
  'AI Movies',
  'Short Films',
  'AI TV Shows',
  'Episodic Series',
  'Animated Episodes',
]);

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ') && authHeader !== 'Bearer ') {
      const token = authHeader.replace('Bearer ', '').trim();
      const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await supabaseUserClient.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    if (!userId && process.env.NODE_ENV === 'development') {
      userId = '00000000-0000-0000-0000-000000000000';
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in before publishing a drop.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      genre,
      contentRating,
      description,
      selectedTier,
      videoUrl,
      artworkUrl,
      artistName,
    } = body;

    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!genre || !ALLOWED_GENRES.has(genre)) {
      return NextResponse.json({ error: 'Invalid genre category.' }, { status: 400 });
    }

    // --- TIER & FEATURE RESTRICTION VALIDATION ---
    const normalizedTier =
      selectedTier === 'pro' ? 'pro' : selectedTier === 'featured' ? 'featured' : 'free';
    const isPaidTier = normalizedTier === 'featured' || normalizedTier === 'pro';

    if (genre === 'AI Movies' && !isPaidTier) {
      return NextResponse.json(
        { error: 'Unauthorized: AI Movies require a Featured Spotlight ($25/mo) or Pro Pass ($75/mo) subscription tier.' },
        { status: 403 }
      );
    }

    // --- TEEN (T) & GENERAL CONTENT SAFETY FILTER ---
    if (contentRating === 'Teen (T)' || contentRating === 'Teen' || contentRating === 'General') {
      const explicitKeywords = ['nsfw', 'explicit', '18+', 'uncensored', 'adult', 'porn', 'xxx'];
      const combinedText = `${cleanTitle} ${description || ''}`.toLowerCase();

      const containsExplicitContent = explicitKeywords.some((keyword) =>
        combinedText.includes(keyword)
      );

      if (containsExplicitContent) {
        return NextResponse.json(
          { error: 'Content Safety Policy: Submissions rated as Teen (T) or General cannot contain explicit or mature keywords.' },
          { status: 400 }
        );
      }
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey || supabaseAnonKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    let finalCreatorName =
      typeof artistName === 'string' && artistName.trim() ? artistName.trim() : 'King Ducko';

    if (userId !== '00000000-0000-0000-0000-000000000000') {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('moniker')
        .eq('id', userId)
        .maybeSingle();
      if (profileData?.moniker) {
        finalCreatorName = profileData.moniker;
      }
    }

    const { data: filmData, error: insertError } = await supabaseAdmin
      .from('films')
      .insert([
        {
          user_id: userId,
          title: cleanTitle,
          creator_name: finalCreatorName,
          genre,
          content_rating: contentRating || 'General',
          description: typeof description === 'string' ? description.trim() : '',
          tier: normalizedTier,
          is_featured: isPaidTier,
          video_url: videoUrl || null,
          artwork_url: artworkUrl || null,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, filmId: filmData.id });
  } catch (err: any) {
    console.error('Submit Film API Error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}