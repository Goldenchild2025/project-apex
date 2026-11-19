// lib/genres.ts

export const PROJECT_APEX_GENRES = [
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
] as const;

export type ApexGenre = typeof PROJECT_APEX_GENRES[number];

// Helper to normalize and match genres safely across filters & case variations
export function normalizeGenre(genre?: string): string {
  if (!genre) return 'Cyber Rap';
  const match = PROJECT_APEX_GENRES.find(
    (g) => g.toLowerCase() === genre.trim().toLowerCase()
  );
  return match || genre.trim();
}