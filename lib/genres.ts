// lib/genres.ts

export const PROJECT_APEX_GENRES = [
  'Cyber Rap',
  'AI Cinematic',
  'Sci-Fi Trap',
  'Electronic Future',
  'Virtual Pop',
  'Darkwave',
] as const;

export type ApexGenre = typeof PROJECT_APEX_GENRES[number];

// Helper to normalize and match genres safely across filters & case variations
export function normalizeGenre(genre?: string): string {
  if (!genre) return 'Cyber Rap';
  const match = PROJECT_APEX_GENRES.find(
    g => g.toLowerCase() === genre.trim().toLowerCase()
  );
  return match || genre.trim();
}