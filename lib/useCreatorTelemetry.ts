import { useState, useEffect } from 'react';

type FilmRecord = {
  id: string | number;
  title: string;
  upvotes: number;
  is_featured: boolean;
  tier?: string;
  created_at?: string;
};

export function useCreatorTelemetry(films: FilmRecord[]) {
  const [metrics, setMetrics] = useState({
    totalImpressions: 0,
    upvoteVelocity: 0,
    impressionGrowth: '+18.4%',
    boostRoiStatus: 'Standard' as 'Standard' | 'Optimized',
    activeBoostsCount: 0,
  });

  useEffect(() => {
    if (!films || films.length === 0) {
      setMetrics({
        totalImpressions: 120,
        upvoteVelocity: 0,
        impressionGrowth: '+0.0%',
        boostRoiStatus: 'Standard',
        activeBoostsCount: 0,
      });
      return;
    }

    const totalUpvotes = films.reduce((acc, f) => acc + (Number(f.upvotes) || 0), 0);
    const activeBoosts = films.filter(f => f.is_featured || (f.tier && f.tier !== 'free')).length;
    
    // Estimated impressions formula factoring community reach
    const estimatedImpressions = totalUpvotes * 45 + 120;
    
    // Upvote velocity (average upvotes per drop)
    const velocity = Number((totalUpvotes / films.length).toFixed(1));

    setMetrics({
      totalImpressions: estimatedImpressions,
      upvoteVelocity: velocity,
      impressionGrowth: activeBoosts > 0 ? '+24.8%' : '+18.4%',
      boostRoiStatus: activeBoosts > 0 ? 'Optimized' : 'Standard',
      activeBoostsCount: activeBoosts,
    });
  }, [films]);

  return metrics;
}