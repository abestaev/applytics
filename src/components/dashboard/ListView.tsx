import { Fragment, useState } from 'react';
import { T } from '@/tokens';
import { STATUS_META, STATUS_ORDER } from '@/data/mockData';
import { StatusTag, StatusDot, CodeTag, ToolBtn } from './Primitives';
import type { Application, StatusType } from '@/types/dashboard';

type SortKey = keyof Application;
type SortDir = 'asc' | 'desc';

const HEADERS: { k: SortKey; label: string; w: number; right?: boolean }[] = [
  { k: 'id',       label: 'ID',      w: 80 },
  { k: 'company',  label: 'COMPANY', w: 130 },
  { k: 'role',     label: 'ROLE',    w: 220 },
  { k: 'status',   label: 'STATUS',  w: 80 },
  { k: 'source',   label: 'SOURCE',  w: 140 },
  { k: 'loc',      label: 'LOC',     w: 90 },
  { k: 'remote',   label: 'MODE',    w: 70 },
  { k: 'salary',   label: 'SALARY',  w: 80 },
  { k: 'sentDays', label: 'SENT',    w: 60, right: true },
  { k: 'lastDays', label: 'LAST',    w: 60, right: true },
  { k: 'priority', label: 'P',       w: 32, right: true },
];

// ── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ app, onEdit, onDelete }: {
  app: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const pipelineSteps: StatusType[] = ['draft', 'sent', 'followup', 'interview', 'offer'];
  const curIdx = STATUS_ORDER.indexOf(app.status);

  return (
    <div style={{ background: T.bg1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.br0}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CodeTag tone="accent">{app.id.slice(0, 8)}</CodeTag>
          <span style={{ flex: 1 }} />
          <StatusTag status={app.status} />
          <CodeTag tone={app.priority === 1 ? 'accent' : 'gray'}>P{app.priority}</CodeTag>
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: T.fg0, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {app.company}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.fg1, marginTop: 2 }}>{app.role}</div>
      </div>

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
          ['SENT',       app.sentDays === 0 ? '—' : `${app.sentDays}d ago`],
          ['LAST EVENT', app.lastDays === 0 ? 'today' : `${app.lastDays}d ago`],
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
        <ToolBtn onClick={() => onEdit(app)}>EDIT</ToolBtn>
        <span style={{ flex: 1 }} />
        {confirming ? (
          <>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, alignSelf: 'center' }}>Confirmer ?</span>
            <ToolBtn onClick={() => onDelete(app.id)}>OUI</ToolBtn>
            <ToolBtn onClick={() => setConfirming(false)}>NON</ToolBtn>
          </>
        ) : (
          <ToolBtn onClick={() => setConfirming(true)}>
            <span style={{ color: T.rejected }}>DELETE</span>
          </ToolBtn>
        )}
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

export function ListView({ apps, query = '', onEdit, onDelete }: {
  apps: Application[];
  query?: string;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}) {
  const [sortKey, setSortKey]     = useState<SortKey>('sentDays');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');
  const [statusFilter, setFilter] = useState<StatusType | 'ALL'>('ALL');
  const [selected, setSelected]   = useState<string>(apps[0]?.id ?? '');

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

  const sel = apps.find(a => a.id === selected) ?? filtered[0];

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 1, background: T.br0, flex: 1, minHeight: 0 }}>
      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', background: T.bg1, minHeight: 0 }}>
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
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
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
                <tr key={a.id} onClick={() => setSelected(a.id)} style={{
                  height: 30,
                  background: a.id === selected ? T.accentDim : i % 2 ? T.bg1 : T.bg2,
                  color: T.fg1, borderBottom: `1px solid ${T.br0}`, cursor: 'pointer',
                  borderLeft: a.id === selected ? `2px solid ${T.accent}` : '2px solid transparent',
                }}>
                  <td style={{ padding: '0 10px', color: T.fg3, fontSize: 10 }}>{a.id.slice(0, 8)}</td>
                  <td style={{ padding: '0 10px', color: T.fg0, fontWeight: 500 }}>{a.company}</td>
                  <td style={{ padding: '0 10px', color: T.fg1, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
                  <td style={{ padding: '0 10px' }}><StatusTag status={a.status as StatusType} /></td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.source}</td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.loc}</td>
                  <td style={{ padding: '0 10px', color: T.fg2 }}>{a.remote}</td>
                  <td style={{ padding: '0 10px', color: T.fg1, fontVariantNumeric: 'tabular-nums' }}>{a.salary}</td>
                  <td style={{ padding: '0 10px', textAlign: 'right', color: T.fg1, fontVariantNumeric: 'tabular-nums' }}>
                    {a.sentDays === 0 ? '—' : `${a.sentDays}d`}
                  </td>
                  <td style={{
                    padding: '0 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                    color: a.lastDays > 14 ? T.rejected : a.lastDays > 7 ? T.followup : T.fg1,
                  }}>
                    {a.lastDays === 0 ? 'now' : `${a.lastDays}d`}
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
