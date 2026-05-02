import type { CSSProperties } from 'react';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { Panel, Metric, StatusTag, StatusDot, CodeTag, HBar } from './Primitives';
import { computeStats } from '@/utils/stats';
import type { Application, StatusType } from '@/types/dashboard';

const COL_HEADER: CSSProperties = {
  textAlign: 'left', padding: '5px 10px', fontWeight: 500,
  borderBottom: `1px solid ${T.br0}`, position: 'sticky', top: 0,
  background: T.bg1, zIndex: 1, color: T.fg3, fontSize: 9.5,
  letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--mono)',
};

function PipelinePanel({ apps }: { apps: Application[] }) {
  const sorted = apps.slice().sort((a, b) => a.sentDays - b.sentDays).slice(0, 14);

  if (apps.length === 0) {
    return (
      <Panel code="01" title="Pipeline" style={{ gridRow: '2 / 3' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3,
          letterSpacing: '0.08em', padding: 24,
        }}>
          Aucune candidature — clique sur + NEW pour commencer
        </div>
      </Panel>
    );
  }

  return (
    <Panel code="01" title="Pipeline · last 14"
      action={<span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2 }}>sorted by sent_at desc</span>}
      style={{ gridRow: '2 / 3' }} scroll
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
        <thead>
          <tr>
            {['COMPANY', 'ROLE', 'STATUS', 'SRC', 'LOC', 'SENT', 'LAST', 'P'].map((h, i) => (
              <th key={h} style={{ ...COL_HEADER, textAlign: i >= 5 && i <= 6 ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, i) => (
            <tr key={a.id} style={{ color: T.fg1, background: i % 2 ? T.bg1 : T.bg2, borderBottom: `1px solid ${T.br0}` }}>
              <td style={{ padding: '5px 10px', color: T.fg0, fontWeight: 500 }}>{a.company}</td>
              <td style={{ padding: '5px 10px', color: T.fg1, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
              <td style={{ padding: '4px 10px' }}><StatusTag status={a.status as StatusType} /></td>
              <td style={{ padding: '5px 10px', color: T.fg2, fontSize: 10 }}>{a.source.split(' ')[0].slice(0, 4).toUpperCase()}</td>
              <td style={{ padding: '5px 10px', color: T.fg2 }}>{a.loc}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right', color: T.fg1, fontVariantNumeric: 'tabular-nums' }}>
                {a.sentDays === 0 ? '—' : `${a.sentDays}d`}
              </td>
              <td style={{ padding: '5px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: a.lastDays > 14 ? T.rejected : a.lastDays > 7 ? T.followup : T.fg1 }}>
                {a.lastDays === 0 ? 'now' : `${a.lastDays}d`}
              </td>
              <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                <CodeTag tone={a.priority === 1 ? 'accent' : 'gray'}>P{a.priority}</CodeTag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function MiddleColumn({ apps, total }: { apps: Application[]; total: number }) {
  const bySource: Record<string, number> = {};
  apps.forEach(a => { bySource[a.source] = (bySource[a.source] ?? 0) + 1; });
  const sourceEntries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const sourceMax = sourceEntries[0]?.[1] ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: T.br0, gridRow: '2 / 3' }}>
      <Panel code="02" title="Pipeline distribution">
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {total === 0 ? (
            <span style={{ color: T.fg3, fontFamily: 'var(--mono)', fontSize: 10.5 }}>Aucune candidature</span>
          ) : STATUS_ORDER.map(s => {
            const count = apps.filter(a => a.status === s).length;
            const m = STATUS_META[s];
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 10.5 }}>
                <div style={{ width: 70, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusDot status={s} />
                  <span style={{ color: T.fg1, letterSpacing: '0.06em' }}>{m.label}</span>
                </div>
                <HBar value={count} max={total} tone={s} />
                <span style={{ color: T.fg0, width: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--mono)' }}>{count}</span>
                <span style={{ color: T.fg3, width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--mono)' }}>
                  {((count / total) * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel code="03" title="Sources" style={{ flex: 1 }}>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--mono)', fontSize: 10.5 }}>
          {sourceEntries.length === 0 ? (
            <span style={{ color: T.fg3, fontSize: 10.5 }}>Aucune source</span>
          ) : sourceEntries.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 150, color: T.fg1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
              <HBar value={v} max={sourceMax} tone="accent" height={3} />
              <span style={{ color: T.fg0, width: 22, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function DashboardView({ apps }: { apps: Application[] }) {
  const stats = computeStats(apps);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gridTemplateRows: 'auto 1fr',
      gap: 1, background: T.br0, flex: 1, minHeight: 0, padding: 1,
    }}>
      {/* KPI strip */}
      <div style={{
        gridColumn: '1 / -1', background: T.bg1,
        padding: '14px 18px', display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)', gap: 24,
      }}>
        <Metric label="TOTAL APPS"  value={String(stats.total).padStart(3, '0')}  sub={`${stats.total - stats.sent} draft`} />
        <Metric label="SENT"        value={String(stats.sent).padStart(3, '0')}   sub={`${stats.responses} replies`} />
        <Metric label="RESPONSE %"  value={`${stats.responseRate}%`}              sub={`${stats.responses} replies`}  tone="amber" />
        <Metric label="INTERVIEW %" value={`${stats.interviewRate}%`}             sub={`${stats.interviews} active`} tone="cyan" />
        <Metric label="OFFERS"      value={String(stats.offers).padStart(2, '0')} sub="deciding"                     tone="lime" />
        <Metric label="REJECTED"    value={String(apps.filter(a => a.status === 'rejected').length).padStart(2, '0')} sub="ghosted or refused" tone="red" />
      </div>

      <PipelinePanel apps={apps} />
      <MiddleColumn apps={apps} total={stats.total} />
    </div>
  );
}
