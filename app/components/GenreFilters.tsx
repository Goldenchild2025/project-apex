'use client';

const GENRES = [
  'All Genres',
  'AI Movies',
  'Cyber Rap',
  'Synthwave',
  'AI Phonk',
  'Neural Trap',
  'Short Films',
  'Rap Battle',
  'Music Video',
];

interface GenreFiltersProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
}

export function GenreFilters({ selectedGenre, onSelectGenre }: GenreFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 my-4 scrollbar-none">
      {GENRES.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelectGenre(genre)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
            selectedGenre === genre
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}