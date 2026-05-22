import type { Application } from '@/types/dashboard';

export function formatDays(days: number): string {
  if (days < 1 / 24) return 'now';
  if (days < 1) return `${Math.round(days * 24)}h`;
  return `${Math.floor(days)}d`;
}

export function computeStats(apps: Application[]) {
  const sent      = apps.filter(a => a.status !== 'draft').length;
  const responses = apps.filter(a => ['interview','offer','rejected'].includes(a.status)).length;
  const interviews= apps.filter(a => ['interview','offer'].includes(a.status)).length;
  const offers    = apps.filter(a => a.status === 'offer').length;
  return {
    total: apps.length,
    sent,
    responses,
    interviews,
    offers,
    responseRate:  sent > 0 ? ((responses  / sent) * 100).toFixed(1) : '0.0',
    interviewRate: sent > 0 ? ((interviews / sent) * 100).toFixed(1) : '0.0',
  };
}
