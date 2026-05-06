import { T } from '@/tokens';
import { Panel } from './Primitives';
import { computeStats } from '@/utils/stats';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Application } from '@/types/dashboard';

export function StatsView({ apps }: { apps: Application[] }) {
  const stats = computeStats(apps);
  const isCompact = useIsMobile(1440);

  const funnel = [
    { label: 'SUBMITTED', count: stats.sent },
    { label: 'RESPONDED', count: stats.responses },
    { label: 'INTERVIEW', count: apps.filter(a => ['interview', 'offer'].includes(a.status)).length },
    { label: 'OFFER',     count: stats.offers },
  ];
  const funnelMax = funnel[0].count || 1;

  // Source efficacy computed from real apps
  const sourceMap: Record<string, { sent: number; reply: number; iv: number }> = {};
  apps.forEach(a => {
    if (a.status === 'draft') return;
    if (!sourceMap[a.source]) sourceMap[a.source] = { sent: 0, reply: 0, iv: 0 };
    sourceMap[a.source].sent++;
    if (['interview', 'offer', 'rejected', 'followup'].includes(a.status)) sourceMap[a.source].reply++;
    if (['interview', 'offer'].includes(a.status)) sourceMap[a.source].iv++;
  });
  const sourceRows = Object.entries(sourceMap)
    .map(([src, d]) => ({ src, ...d, rate: d.sent > 0 ? Math.round((d.reply / d.sent) * 100) : 0 }))
    .sort((a, b) => b.sent - a.sent);

  if (apps.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 11, color: T.fg3, letterSpacing: '0.08em',
      }}>
        Aucune donnée — ajoute des candidatures pour voir les stats
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, minHeight: 0, padding: 1,
      display: 'grid',
      gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
      gridAutoRows: isCompact ? 'max-content' : undefined,
      gridTemplateRows: isCompact ? undefined : '1fr 1fr',
      alignContent: isCompact ? 'start' : undefined,
      gap: 1, background: T.br0,
      overflow: isCompact ? 'auto' : 'hidden',
    }}>
      {/* A — Conversion funnel */}
      <Panel code="A" title="Conversion funnel" expand={isCompact}>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {funnel.map((f, i) => {
            const pct = ((f.count / funnelMax) * 100).toFixed(0);
            const dropoff = i > 0 ? funnel[i - 1].count - f.count : 0;
            return (
              <div key={f.label}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  marginBottom: 5, fontFamily: 'var(--mono)', fontSize: 10.5,
                }}>
                  <span style={{ color: T.fg1, letterSpacing: '0.1em' }}>{f.label}</span>
                  <span>
                    <span style={{ color: T.fg0, fontSize: 14, fontWeight: 600 }}>{f.count}</span>
                    <span style={{ color: T.fg3, marginLeft: 8 }}>{pct}%</span>
                    {dropoff > 0 && f.count > 0 && <span style={{ color: T.rejected, marginLeft: 8 }}>−{dropoff}</span>}
                  </span>
                </div>
                <div style={{ height: 22, background: T.bg2, position: 'relative' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: `linear-gradient(90deg, ${T.accent} 0%, ${T.accent}99 100%)`,
                    boxShadow: `0 0 16px ${T.accent}55`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* B — Source efficacy */}
      <Panel code="B" title="Source efficacy" expand={isCompact}>
        <div style={{ padding: '14px 18px' }}>
          {sourceRows.length === 0 ? (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3 }}>Aucune source</span>
          ) : (
            <table style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: 10.5, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: T.fg3, fontSize: 9.5, letterSpacing: '0.1em' }}>
                  <th style={{ textAlign: 'left',  padding: '6px 0',  fontWeight: 500 }}>SOURCE</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 500 }}>SENT</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 500 }}>REPLY</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 500 }}>IV</th>
                  <th style={{ textAlign: 'right', padding: '6px 0',  fontWeight: 500 }}>RATE</th>
                </tr>
              </thead>
              <tbody>
                {sourceRows.map(r => (
                  <tr key={r.src} style={{ borderTop: `1px solid ${T.br0}` }}>
                    <td style={{ padding: '8px 0', color: T.fg0 }}>{r.src}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: T.fg1 }}>{r.sent}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: T.fg1 }}>{r.reply}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: T.fg1 }}>{r.iv}</td>
                    <td style={{
                      padding: '8px 0', textAlign: 'right', fontWeight: 600,
                      color: r.rate > 60 ? T.offer : r.rate < 20 ? T.rejected : T.followup,
                    }}>{r.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
      {/* C — Response time distribution */}
      <Panel code="C" title="Response time distribution" expand={isCompact}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3,
          letterSpacing: '0.06em',
        }}>
          Available once applications have response dates
        </div>
      </Panel>

      {/* D — Weekly cadence */}
      <Panel code="D" title="Weekly cadence" expand={isCompact}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3,
          letterSpacing: '0.06em',
        }}>
          Available after a few weeks of activity
        </div>
      </Panel>
    </div>
  );
}
