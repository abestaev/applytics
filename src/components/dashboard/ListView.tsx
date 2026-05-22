import { Fragment, useEffect, useRef, useState } from 'react';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { StatusTag, StatusDot, CodeTag, ToolBtn } from './Primitives';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDays } from '@/utils/stats';
import type { Application, StatusType } from '@/types/dashboard';

type SortKey = keyof Application;
type SortDir = 'asc' | 'desc';

const HEADERS: { k: SortKey; label: string; w: number; right?: boolean }[] = [
  { k: 'company',  label: 'COMPANY', w: 110 },
  { k: 'type',     label: 'TYPE',    w: 70 },
  { k: 'role',     label: 'ROLE',    w: 190 },
  { k: 'status',   label: 'STATUS',  w: 80 },
  { k: 'source',   label: 'SOURCE',  w: 110 },
  { k: 'loc',      label: 'LOC',     w: 80 },
  { k: 'remote',   label: 'MODE',    w: 65 },
  { k: 'salary',   label: 'SALARY',  w: 75 },
  { k: 'sentDays', label: 'SENT',    w: 55, right: true },
  { k: 'lastDays', label: 'LAST',    w: 55, right: true },
  { k: 'priority', label: 'P',       w: 30, right: true },
];

const COMPANY_COLUMN_WIDTH = HEADERS.find(h => h.k === 'company')?.w ?? 110;

function formatRelativeDate(value?: string) {
  if (!value) return '—';
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '—';
  const diffMs = Date.now() - time;
  const absMs = Math.abs(diffMs);
  const hourMs = 3_600_000;
  const dayMs = 86_400_000;
  const valueText = absMs < hourMs
    ? 'now'
    : absMs < dayMs
      ? `${Math.floor(absMs / hourMs)}h`
      : `${Math.floor(absMs / dayMs)}d`;
  if (valueText === 'now') return valueText;
  return diffMs < 0 ? `in ${valueText}` : `${valueText} ago`;
}

// ── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ app, onEdit, onDelete }: {
  app: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isMobile = useIsMobile();
  const pipelineSteps: StatusType[] = ['draft', 'sent', 'followup', 'interview', 'offer'];
  const curIdx = STATUS_ORDER.indexOf(app.status);

  useEffect(() => {
    if (!confirming) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-confirm]')) setConfirming(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirming]);

  return (
    <div style={{
      background: T.bg1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: isMobile ? undefined : 0,
      overflow: isMobile ? 'visible' : 'auto',
    }}>
      {/* Header — desktop only */}
      {!isMobile && (
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.br0}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ flex: 1 }} />
            <StatusTag status={app.status} />
            {app.status === 'interview' && app.interviewStage && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5,
                color: app.interviewStage === 'pending_approval' ? T.offer : T.interview,
                background: app.interviewStage === 'pending_approval' ? `${T.offer}15` : `${T.interview}15`,
                padding: '2px 6px', borderRadius: 2,
              }}>
                {app.interviewStage === 'pending_date' ? 'PENDING DATE' : 'PENDING APPROVAL'}
              </span>
            )}
            <CodeTag tone={app.priority === 1 ? 'accent' : 'gray'}>P{app.priority}</CodeTag>
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: T.fg0, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {app.company}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.fg1, marginTop: 2 }}>{app.role}</div>
        </div>
      )}

      {/* Fields */}
      <div style={{
        padding: '14px 16px', display: 'grid', gridTemplateColumns: '80px 1fr',
        gap: '10px 14px', fontFamily: 'var(--mono)', fontSize: 11,
        borderBottom: `1px solid ${T.br0}`, flexShrink: 0,
      }}>
        {([
          ['SOURCE',     app.source],
          ['LOCATION',   `${app.loc} · ${app.remote}`],
          ['SALARY',     app.salary],
          ['CONTACT',    app.contact],
          ['SENT',       app.sentDays === 0 ? '—' : `${formatDays(app.sentDays)} ago`],
          ...(app.status === 'followup' ? [
            ['FOLLOWUP', formatRelativeDate(app.followupDate)] as [string, string],
          ] : []),
          ...(app.status === 'interview' && app.interviewDate ? [
            ['INTERVIEW', new Date(app.interviewDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })] as [string, string],
          ] : []),
          ['LAST EVENT', formatDays(app.lastDays)],
        ] as [string, string][]).map(([k, v]) => (
          <Fragment key={k}>
            <span style={{ color: T.fg3, letterSpacing: '0.08em', fontSize: 9.5, alignSelf: 'center' }}>{k}</span>
            <span style={{ color: T.fg0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
          </Fragment>
        ))}
        <span style={{ color: T.fg3, letterSpacing: '0.08em', fontSize: 9.5, alignSelf: 'center' }}>LINK</span>
        {app.link ? (
          <a
            href={app.link.startsWith('http') ? app.link : `https://${app.link}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              color: T.accent, fontFamily: 'var(--mono)', fontSize: 11,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >{app.link}</a>
        ) : (
          <span style={{ color: T.fg3 }}>—</span>
        )}
      </div>

      {/* Pipeline */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.br0}`, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em', marginBottom: 10 }}>PIPELINE</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {pipelineSteps.map((s, i) => {
            const meIdx = STATUS_ORDER.indexOf(s);
            const passed = curIdx >= meIdx && app.status !== 'rejected';
            const tone = STATUS_META[s].tone;
            return (
              <Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: passed ? tone : T.br1, boxShadow: passed ? `0 0 8px ${tone}` : 'none' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: passed ? T.fg1 : T.fg3, letterSpacing: '0.05em' }}>{STATUS_META[s].short}</span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div style={{ flex: 1, height: 1, marginBottom: 16, background: passed && STATUS_ORDER.indexOf(pipelineSteps[i + 1]) <= curIdx ? tone : T.br1, opacity: passed ? 0.5 : 1 }} />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.br0}`, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em', marginBottom: 6 }}>NOTES</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: app.notes ? T.fg1 : T.fg3, lineHeight: 1.5 }}>
          {app.notes || '—'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 6, flexShrink: 0 }}>
        {confirming ? (
          <div data-confirm style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, alignSelf: 'center' }}>Confirm?</span>
            <ToolBtn onClick={() => onDelete(app.id)} style={isMobile ? { border: `1px solid ${T.br2}` } : undefined}>YES</ToolBtn>
            <ToolBtn onClick={() => setConfirming(false)} style={isMobile ? { border: `1px solid ${T.br2}` } : undefined}>CANCEL</ToolBtn>
          </div>
        ) : (
          <ToolBtn onClick={() => setConfirming(true)}>
            <span style={{ color: T.rejected }}>DELETE</span>
          </ToolBtn>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={() => onEdit(app)} style={{
          background: T.accent, border: `1px solid ${T.accent}`,
          color: '#0a0b0d', fontFamily: 'var(--mono)', fontSize: 10.5,
          fontWeight: 700, letterSpacing: '0.06em', padding: '4px 9px',
          cursor: 'pointer', borderRadius: 2,
        }}>EDIT</button>
      </div>

      {app.status === 'rejected' && (
        <div style={{ margin: '0 16px 14px', padding: '8px 12px', background: `${T.rejected}15`, border: `1px solid ${T.rejected}40`, fontFamily: 'var(--mono)', fontSize: 10.5, color: T.rejected }}>
          REJECTED — no further action needed.
        </div>
      )}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

export function ListView({ apps, query = '', selectedApplicationId, onEdit, onDelete }: {
  apps: Application[];
  query?: string;
  selectedApplicationId?: string | null;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}) {
  const [sortKey, setSortKey]     = useState<SortKey>('sentDays');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');
  const [statusFilter, setFilter] = useState<StatusType | 'ALL'>('ALL');
  const [selected, setSelected]   = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | HTMLTableRowElement | null>>({});
  const isMobile = useIsMobile();
  const isCompactDesktop = useIsMobile(1180);

  useEffect(() => {
    if (!selectedApplicationId) return;
    const frame = window.requestAnimationFrame(() => {
      setFilter('ALL');
      setSelected(selectedApplicationId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedApplicationId]);

  const filtered = apps.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (query && !`${a.company} ${a.role} ${a.id}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  useEffect(() => {
    if (!selectedApplicationId) return;
    window.requestAnimationFrame(() => {
      rowRefs.current[selectedApplicationId]?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    });
  }, [selectedApplicationId, filtered.length]);

  const selectedInFiltered = selected ? filtered.some(a => a.id === selected) : false;
  const effectiveSelected = !isMobile && filtered.length > 0 && !selectedInFiltered
    ? filtered[0].id
    : selected;
  const sel = effectiveSelected ? apps.find(a => a.id === effectiveSelected) : null;

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  if (isMobile) {
    return (
      <div style={{
        background: T.br0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flex: '1 0 auto',
      }}>
        <div style={{
          background: T.bg1,
          borderBottom: `1px solid ${T.br0}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
          padding: '10px 10px 9px',
          position: 'sticky',
          top: 52,
          zIndex: 40,
        }}>
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 1,
          }}>
            <ToolBtn active={statusFilter === 'ALL'} onClick={() => setFilter('ALL')}>
              ALL {apps.length}
            </ToolBtn>
            {STATUS_ORDER.map(s => (
              <ToolBtn key={s} active={statusFilter === s} onClick={() => setFilter(s)}>
                <span style={{ color: STATUS_META[s].tone }}>{STATUS_META[s].short}</span>
                <span> {apps.filter(a => a.status === s).length}</span>
              </ToolBtn>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: T.fg3,
          }}>
            <span>{filtered.length} of {apps.length}</span>
            <span style={{ flex: 1 }} />
            <ToolBtn active={sortKey === 'sentDays'} onClick={() => toggleSort('sentDays')}>
              SENT {sortKey === 'sentDays' && (sortDir === 'asc' ? '↑' : '↓')}
            </ToolBtn>
            <ToolBtn active={sortKey === 'lastDays'} onClick={() => toggleSort('lastDays')}>
              LAST {sortKey === 'lastDays' && (sortDir === 'asc' ? '↑' : '↓')}
            </ToolBtn>
            <ToolBtn active={sortKey === 'priority'} onClick={() => toggleSort('priority')}>
              P {sortKey === 'priority' && (sortDir === 'asc' ? '↑' : '↓')}
            </ToolBtn>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.length === 0 && (
            <div style={{
              background: T.bg1,
              padding: 18,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: T.fg3,
            }}>
              No applications match this filter.
            </div>
          )}

          {filtered.map(a => {
            const active = a.id === selected;
            return (
              <Fragment key={a.id}>
                <div
                  ref={el => { rowRefs.current[a.id] = el; }}
                  onClick={() => setSelected(active ? null : a.id)}
                  onDoubleClick={() => onEdit(a)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSelected(active ? null : a.id);
                  }}
                  style={{
                    background: T.bg1,
                    borderLeft: active ? `2px solid ${T.accent}` : '2px solid transparent',
                    padding: '12px 12px 11px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--display)',
                        fontSize: 15,
                        fontWeight: 600,
                        color: active ? T.accent : T.fg0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {a.company}
                      </div>
                      <div style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10.5,
                        color: T.fg1,
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {a.role}
                      </div>
                    </div>
                    <StatusTag status={a.status as StatusType} />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: T.fg3,
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.loc} · {a.remote}
                    </span>
                    <span style={{
                      color: a.lastDays > 14 ? T.rejected : a.lastDays > 7 ? T.followup : T.fg2,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatDays(a.lastDays)}
                    </span>
                    <CodeTag tone={a.priority === 1 ? 'accent' : 'gray'}>P{a.priority}</CodeTag>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--mono)',
                    fontSize: 9.5,
                    color: T.fg3,
                  }}>
                    <span>{a.sentDays === 0 ? 'draft' : `sent ${formatDays(a.sentDays)} ago`}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ color: active ? T.accent : T.fg3 }}>{active ? 'OPEN' : 'DETAIL'}</span>
                  </div>
                </div>

                {active && (
                  <div style={{ borderTop: `1px solid ${T.br0}`, borderBottom: `1px solid ${T.br0}` }}>
                    <DetailPanel app={a} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isCompactDesktop ? 'minmax(0, 1fr) 290px' : 'minmax(0, 1fr) 320px',
      gap: 1,
      background: T.br0,
      flex: isMobile ? '1 0 auto' : 1,
      minHeight: isMobile ? undefined : 0,
    }}>
      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', background: T.bg1, minHeight: isMobile ? undefined : 0 }}>
        {/* Filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderBottom: `1px solid ${T.br0}`,
          fontFamily: 'var(--mono)', fontSize: 10.5, flexShrink: 0, flexWrap: 'wrap',
        }}>
          <span style={{ color: T.fg3, marginRight: 2 }}>FILTER</span>
          <ToolBtn active={statusFilter === 'ALL'} onClick={() => setFilter('ALL')}>
            ALL · {apps.length}
          </ToolBtn>
          {STATUS_ORDER.map(s => (
            <ToolBtn key={s} active={statusFilter === s} onClick={() => setFilter(s)}>
              <StatusDot status={s} size={5} />
              <span>{STATUS_META[s].label} · {apps.filter(a => a.status === s).length}</span>
            </ToolBtn>
          ))}
          <span style={{ flex: 1 }} />
          <span style={{ color: T.fg3 }}>{filtered.length} of {apps.length}</span>
        </div>

        {/* Table */}
        <div style={{
          overflowX: 'auto',
          overflowY: isMobile ? 'visible' : 'auto',
          flex: isMobile ? '0 0 auto' : 1,
          WebkitOverflowScrolling: 'touch',
        }}>
          <table style={{ width: '100%', minWidth: isCompactDesktop ? 960 : 1020, tableLayout: 'fixed', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <colgroup>
              {HEADERS.map(h => (
                <col key={h.k} style={{ width: h.w }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {HEADERS.map(h => (
                  <th key={h.k} onClick={() => toggleSort(h.k)} style={{
                    width: h.w, textAlign: h.right ? 'right' : 'left',
                    padding: '6px 10px', fontWeight: 500, fontSize: 9.5, letterSpacing: '0.1em',
                    background: T.bg2, borderBottom: `1px solid ${T.br1}`,
                    position: 'sticky', top: 0, cursor: 'pointer', userSelect: 'none',
                    color: sortKey === h.k ? T.accent : T.fg3,
                  }}>
                    {h.label}
                    {sortKey === h.k && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  ref={el => { rowRefs.current[a.id] = el; }}
                  onClick={() => setSelected(a.id)}
                  onDoubleClick={() => onEdit(a)}
                  style={{
                  height: 30,
                  background: a.id === effectiveSelected ? T.accentDim : i % 2 ? T.bg1 : T.bg2,
                  color: T.fg1, borderBottom: `1px solid ${T.br0}`, cursor: 'pointer',
                  borderLeft: a.id === effectiveSelected ? `2px solid ${T.accent}` : '2px solid transparent',
                }}>
                  <td title={a.company} style={{ padding: '0 10px', color: T.fg0, fontWeight: 500, maxWidth: COMPANY_COLUMN_WIDTH, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.company}</td>
                  <td style={{ padding: '0 10px', color: T.fg2, fontSize: 10 }}>{a.type ?? 'stage'}</td>
                  <td style={{ padding: '0 10px', color: T.fg1, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
                  <td style={{ padding: '0 10px' }}><StatusTag status={a.status as StatusType} /></td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.source}</td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.loc}</td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.remote}</td>
                  <td style={{ padding: '0 10px', color: T.fg1, fontVariantNumeric: 'tabular-nums' }}>{a.salary}</td>
                  <td style={{ padding: '0 10px', textAlign: 'right', color: T.fg1, fontVariantNumeric: 'tabular-nums' }}>
                    {a.sentDays === 0 ? '—' : formatDays(a.sentDays)}
                  </td>
                  <td style={{
                    padding: '0 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                    color: a.lastDays > 14 ? T.rejected : a.lastDays > 7 ? T.followup : T.fg1,
                  }}>
                    {formatDays(a.lastDays)}
                  </td>
                  <td style={{ padding: '0 10px', textAlign: 'right' }}>
                    <CodeTag tone={a.priority === 1 ? 'accent' : 'gray'}>P{a.priority}</CodeTag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <DetailPanel key={sel.id} app={sel} onEdit={onEdit} onDelete={onDelete} />}
    </div>
  );
}
