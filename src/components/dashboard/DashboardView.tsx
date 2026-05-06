import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { Panel, Metric, StatusTag, StatusDot, CodeTag, HBar, Pill, Sparkbars } from './Primitives';
import { computeStats, formatDays } from '@/utils/stats';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Application, StatusType } from '@/types/dashboard';

const COL_HEADER: CSSProperties = {
  textAlign: 'left', padding: '5px 10px', fontWeight: 500,
  borderBottom: `1px solid ${T.br0}`, position: 'sticky', top: 0,
  background: T.bg1, zIndex: 1, color: T.fg3, fontSize: 9.5,
  letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--mono)',
};

function PipelinePanel({ apps, expand, code = '01', style }: {
  apps: Application[];
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  const sorted = apps.slice().sort((a, b) => a.sentDays - b.sentDays).slice(0, 14);

  if (apps.length === 0) {
    return (
      <Panel code={code} title="Pipeline" style={{ gridRow: '2 / 3', ...style }} expand={expand}>
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
      <Panel code={code} title="Pipeline · last 14"
      action={<span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2 }}>sorted by sent_at desc</span>}
      style={{ gridRow: '2 / 3', ...style }} scroll={!expand} expand={expand}
    >
      <div style={{ width: '100%', overflowX: expand ? 'auto' : 'visible' }}>
        <table style={{ width: '100%', minWidth: expand ? 760 : undefined, borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
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
                  {a.sentDays === 0 ? '—' : formatDays(a.sentDays)}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: a.lastDays > 14 ? T.rejected : a.lastDays > 7 ? T.followup : T.fg1 }}>
                  {formatDays(a.lastDays)}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                  <CodeTag tone={a.priority === 1 ? 'accent' : 'gray'}>P{a.priority}</CodeTag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function DistributionPanel({ apps, total, expand, code = '02', style }: {
  apps: Application[];
  total: number;
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  return (
    <Panel code={code} title="Pipeline distribution" style={style} expand={expand}>
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
  );
}

function SourcesPanel({ apps, expand, code = '03', style }: {
  apps: Application[];
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  const bySource: Record<string, number> = {};
  apps.forEach(a => { bySource[a.source] = (bySource[a.source] ?? 0) + 1; });
  const sourceEntries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const sourceMax = sourceEntries[0]?.[1] ?? 1;

  return (
    <Panel code={code} title="Sources" style={style} expand={expand}>
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
  );
}

function MiddleColumn({ apps, total, expand, codes = { distribution: '02', sources: '03', activity: '06' } }: {
  apps: Application[];
  total: number;
  expand?: boolean;
  codes?: { distribution: string; sources: string; activity: string };
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 1, background: T.br0, gridRow: '2 / 3',
      flexShrink: expand ? 0 : undefined,
    }}>
      <DistributionPanel apps={apps} total={total} expand={expand} code={codes.distribution} />
      <SourcesPanel apps={apps} expand={expand} code={codes.sources} style={{ flex: 1 }} />
      <ActivityPanel apps={apps} expand={expand} code={codes.activity} />
    </div>
  );
}

const clampDailyGoal = (value: number) => Math.max(1, Math.min(1000, Math.round(value || 1)));

function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
}

function TodoPanel({ apps, expand, code = '04', style }: {
  apps: Application[];
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  const { dailyGoal, setDailyGoal } = useUserSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState(String(dailyGoal));

  useEffect(() => { setGoalDraft(String(dailyGoal)); }, [dailyGoal]);

  const followups = useMemo(() => apps
    .filter(a => ['sent', 'followup'].includes(a.status) && a.sentDays >= 7)
    .slice()
    .sort((a, b) => b.sentDays - a.sentDays), [apps]);

  const appliedToday = useMemo(() => apps
    .filter(a => a.status !== 'draft' && isToday(a.sentAt))
    .length, [apps]);

  const remaining = Math.max(dailyGoal - appliedToday, 0);
  const progress = Math.min((appliedToday / dailyGoal) * 100, 100);
  const todoCount = followups.length + (remaining > 0 ? 1 : 0);

  const openSettings = () => {
    setGoalDraft(String(dailyGoal));
    setSettingsOpen(true);
  };

  const saveGoal = () => {
    const next = Number(goalDraft);
    void setDailyGoal(clampDailyGoal(Number.isFinite(next) ? next : dailyGoal));
    setSettingsOpen(false);
  };

  return (
    <Panel code={code} title="Today"
      action={<CodeTag tone={todoCount > 0 ? 'accent' : 'lime'}>{todoCount} TODO</CodeTag>}
      style={style}
      scroll={!expand} expand={expand}
    >
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--mono)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ color: T.fg1, fontSize: 10.5, letterSpacing: '0.08em' }}>DAILY GOAL</span>
            <span style={{ flex: 1 }} />
            <button
              onClick={openSettings}
              title="Daily goal settings"
              style={{
                width: 24, height: 22, background: T.bg0, border: `1px solid ${T.br1}`,
                color: T.fg1, cursor: 'pointer', fontFamily: 'var(--mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >⚙</button>
          </div>
          <div style={{ height: 5, background: T.br0, position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, right: `${100 - progress}%`,
              background: remaining === 0 ? T.offer : T.accent,
              boxShadow: `0 0 10px ${(remaining === 0 ? T.offer : T.accent)}66`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T.fg3 }}>
            <span>{appliedToday}/{dailyGoal} applications today</span>
            <span style={{ color: remaining === 0 ? T.offer : T.followup }}>
              {remaining === 0 ? 'done' : `${remaining} left`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {remaining > 0 && (
            <div style={{ padding: '9px 10px', background: T.bg2, border: `1px solid ${T.br0}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill tone="accent" size="xs">APPLY</Pill>
                <span style={{ color: T.fg0, fontSize: 10.5 }}>{remaining} new application{remaining > 1 ? 's' : ''}</span>
              </div>
              <div style={{ color: T.fg3, fontSize: 10, marginTop: 4 }}>Reach your daily application goal</div>
            </div>
          )}

          {followups.slice(0, 5).map(a => (
            <div key={a.id} style={{ padding: '9px 10px', background: T.bg2, border: `1px solid ${T.br0}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill tone="amber" size="xs">FU</Pill>
                <span style={{ color: T.fg0, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.company}
                </span>
                <span style={{ flex: 1 }} />
                <CodeTag tone={a.sentDays >= 14 ? 'red' : 'amber'}>{formatDays(a.sentDays)}</CodeTag>
              </div>
              <div style={{ color: T.fg3, fontSize: 10, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Sent at least 7 days ago without answer
              </div>
            </div>
          ))}

          {followups.length > 5 && (
            <div style={{ color: T.fg3, fontSize: 10, padding: '0 2px' }}>
              +{followups.length - 5} more followups
            </div>
          )}

          {todoCount === 0 && (
            <div style={{ color: T.fg3, fontSize: 10.5, padding: '4px 0' }}>
              All daily tasks are clear
            </div>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div onClick={() => setSettingsOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(8,9,11,.55)',
          zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 300, background: T.bg1, border: `1px solid ${T.br2}`,
            boxShadow: '0 20px 60px rgba(0,0,0,.55)',
          }}>
            <div style={{
              padding: '10px 12px', borderBottom: `1px solid ${T.br0}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CodeTag tone="accent">GOAL</CodeTag>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg0, letterSpacing: '0.08em' }}>
                DAILY APPLICATIONS
              </span>
              <span style={{ flex: 1 }} />
              <button onClick={() => setSettingsOpen(false)} style={{
                background: 'none', border: 'none', color: T.fg2,
                cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}>x</button>
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--mono)' }}>
              <label style={{ fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em' }}>TARGET PER DAY</label>
              <input
                value={goalDraft}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                onChange={e => setGoalDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveGoal();
                  if (e.key === 'Escape') setSettingsOpen(false);
                }}
                style={{
                  width: '100%', height: 32, background: T.bg0, border: `1px solid ${T.br1}`,
                  color: T.fg0, fontFamily: 'var(--mono)', fontSize: 12,
                  padding: '6px 9px', outline: 'none',
                }}
              />
              <span style={{ fontSize: 10, color: T.fg3 }}>Accepted range: 1-1000</span>
            </div>
            <div style={{
              padding: '10px 12px', borderTop: `1px solid ${T.br0}`,
              display: 'flex', gap: 8, justifyContent: 'flex-end',
            }}>
              <button onClick={() => setSettingsOpen(false)} style={{
                background: 'transparent', border: `1px solid ${T.br1}`, color: T.fg1,
                padding: '5px 10px', fontFamily: 'var(--mono)', fontSize: 10,
                cursor: 'pointer',
              }}>CANCEL</button>
              <button onClick={saveGoal} style={{
                background: T.accent, border: 'none', color: '#0a0b0d',
                padding: '5px 12px', fontFamily: 'var(--mono)', fontSize: 10,
                fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
              }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function UpcomingPanel({ apps, expand, code = '05', style }: {
  apps: Application[];
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = apps
    .filter(a => {
      if (a.status !== 'interview' || !a.interviewDate) return false;
      return new Date(a.interviewDate).getTime() >= today.getTime();
    })
    .slice()
    .sort((a, b) => new Date(a.interviewDate ?? '').getTime() - new Date(b.interviewDate ?? '').getTime());

  return (
    <Panel code={code} title="Upcoming" style={style} scroll={!expand} expand={expand}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {upcoming.length === 0 ? (
          <div style={{ padding: '14px 12px', fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3 }}>
            No upcoming interviews
          </div>
        ) : upcoming.map((a, i) => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            borderBottom: i < upcoming.length - 1 ? `1px solid ${T.br0}` : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 12, color: T.fg0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.company}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Pill tone="cyan" size="xs">{STATUS_META[a.status].short}</Pill>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3, marginTop: 3 }}>
                {a.interviewDate
  ? new Date(a.interviewDate).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
  : 'date tbd'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityPanel({ apps, expand, code = '06', style }: {
  apps: Application[];
  expand?: boolean;
  code?: string;
  style?: CSSProperties;
}) {
  const DAYS = 30;
  const [now] = useState(() => Date.now());
  const buckets = Array(DAYS).fill(0) as number[];
  apps.forEach(a => {
    if (!a.sentAt) return;
    const daysAgo = Math.floor((now - new Date(a.sentAt).getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < DAYS) buckets[DAYS - 1 - daysAgo]++;
  });
  const total = buckets.reduce((s, v) => s + v, 0);

  const d = new Date();
  const labels = [
    new Date(d.getFullYear(), d.getMonth(), d.getDate() - 29).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
    new Date(d.getFullYear(), d.getMonth(), d.getDate() - 14).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
  ];

  return (
    <Panel code={code} title="Activity · 30d"
      action={<span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2 }}>{total} apps</span>}
      style={style}
      expand={expand}
    >
      <div style={{ padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {total === 0 ? (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3 }}>No activity yet</span>
        ) : (
          <>
            <Sparkbars data={buckets} height={48} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3 }}>
              {labels.map(l => <span key={l}>{l}</span>)}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

export function DashboardView({ apps }: { apps: Application[] }) {
  const stats = computeStats(apps);
  const isMobile = useIsMobile();
  const isCompactDesktop = useIsMobile(1440);
  const isKpiCompact = useIsMobile(700);

  if (isMobile) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 1, background: T.br0,
        flex: '1 0 auto', overflowX: 'hidden',
        padding: 1, WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          background: T.bg1,
          padding: '12px 10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 7,
        }}>
          {([
            ['SENT', String(stats.sent).padStart(3, '0'), 'fg0'],
            ['RESPONSE', `${stats.responseRate}%`, 'amber'],
            ['INTERVIEW', `${stats.interviewRate}%`, 'cyan'],
            ['OFFERS', String(stats.offers).padStart(2, '0'), 'lime'],
          ] as const).map(([label, value, tone]) => (
            <div key={label} style={{
              border: `1px solid ${T.br0}`,
              background: T.bg1,
              height: 66,
              padding: '8px 4px 7px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: T.fg3,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{label}</div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: value.includes('%') ? 17 : 19,
                lineHeight: 1,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                color: tone === 'amber' ? T.followup : tone === 'cyan' ? T.interview : tone === 'lime' ? T.offer : T.fg0,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{value}</div>
            </div>
          ))}
        </div>
        <TodoPanel apps={apps} expand code="01" />
        <UpcomingPanel apps={apps} expand code="02" />
        <PipelinePanel apps={apps} expand code="03" />
        <MiddleColumn apps={apps} total={stats.total} expand codes={{ distribution: '04', sources: '05', activity: '06' }} />
      </div>
    );
  }

  if (isCompactDesktop) {
    return (
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gridAutoRows: 'max-content',
        alignContent: 'start',
        gap: 1,
        background: T.br0,
        padding: 1,
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          gridColumn: '1 / -1', background: T.bg1,
          padding: '14px 18px', display: 'grid',
          gridTemplateColumns: isKpiCompact ? 'repeat(3, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))',
          gap: isKpiCompact ? '14px 18px' : 24,
        }}>
          <Metric label="TOTAL APPS"  value={String(stats.total).padStart(3, '0')}  sub={`${stats.total - stats.sent} draft`} />
          <Metric label="SENT"        value={String(stats.sent).padStart(3, '0')}   sub={`${stats.responses} replies`} />
          <Metric label="RESPONSE %"  value={`${stats.responseRate}%`}              sub={`${stats.responses} replies`}  tone="amber" />
          <Metric label="INTERVIEW %" value={`${stats.interviewRate}%`}             sub={`${stats.interviews} active`} tone="cyan" />
          <Metric label="OFFERS"      value={String(stats.offers).padStart(2, '0')} sub="deciding"                     tone="lime" />
          <Metric label="REJECTED"    value={String(apps.filter(a => a.status === 'rejected').length).padStart(2, '0')} sub="ghosted or refused" tone="red" />
        </div>

        <PipelinePanel apps={apps} expand style={{ gridColumn: '1 / -1', gridRow: 'auto' }} />
        <DistributionPanel apps={apps} total={stats.total} expand />
        <SourcesPanel apps={apps} expand />
        <TodoPanel apps={apps} expand />
        <UpcomingPanel apps={apps} expand />
        <ActivityPanel apps={apps} expand style={{ gridColumn: '1 / -1' }} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 0.85fr',
      gridTemplateRows: 'auto 1fr',
      gap: 1, background: T.br0, flex: 1, minHeight: 0, padding: 1,
    }}>
      {/* KPI strip */}
      <div style={{
        gridColumn: '1 / -1', background: T.bg1,
        padding: '14px 18px', display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gap: 24,
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

      {/* Right column — Today + Upcoming stacked */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 1, background: T.br0,
        minHeight: 0,
      }}>
        <TodoPanel apps={apps} />
        <UpcomingPanel apps={apps} />
      </div>
    </div>
  );
}
