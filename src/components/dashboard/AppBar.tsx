import { T } from '@/tokens';

import { ToolBtn } from './Primitives';
import type { ViewType } from '@/types/dashboard';

interface AppBarProps {
  view: ViewType;
  onView: (v: ViewType) => void;
  query: string;
  onQuery: (q: string) => void;
  onAdd: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

const VIEWS: [string, ViewType][] = [
  ['DASH', 'dash'],
  ['LIST', 'list'],
  ['BOARD', 'board'],
  ['STATS', 'stats'],
];

export function AppBar({ view, onView, query, onQuery, onAdd, userEmail, onSignOut }: AppBarProps) {
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 14px',
      height: 38, flexShrink: 0,
      background: T.bg1, borderBottom: `1px solid ${T.br1}`,
      fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 18, height: 18, background: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0b0d', fontSize: 11, fontWeight: 800, fontFamily: 'var(--mono)',
          flexShrink: 0,
        }}>A</span>
        <span style={{
          fontFamily: 'var(--display)', fontWeight: 600, fontSize: 13,
          color: T.fg0, letterSpacing: '-0.01em',
        }}>Applytics</span>
        <span style={{ color: T.fg3 }}>·</span>
        <span style={{ color: T.fg2, fontSize: 10.5 }}>v2.0</span>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
        {VIEWS.map(([label, v]) => (
          <ToolBtn key={v} active={view === v} onClick={() => onView(v)}>{label}</ToolBtn>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: T.bg0, border: `1px solid ${T.br1}`,
        padding: '3px 8px', minWidth: 220, height: 24,
      }}>
        <span style={{ color: T.fg3, fontSize: 11 }}>⌕</span>
        <input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="search · filter · jump"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: T.fg0, fontFamily: 'var(--mono)', fontSize: 10.5,
            width: '100%',
          }}
        />
        <span style={{
          color: T.fg3, fontSize: 9, padding: '1px 4px',
          border: `1px solid ${T.br1}`, borderRadius: 2,
        }}>⌘K</span>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        style={{
          background: T.accent, border: 'none', color: '#0a0b0d',
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', padding: '3px 10px', height: 24,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        }}
      >+ NEW</button>

      {/* Status */}
      <div style={{ display: 'flex', gap: 14, color: T.fg2, fontSize: 10.5 }}>
        <span><span style={{ color: T.fg3 }}>UTC</span> {time}</span>
        <span><span style={{ color: T.fg3 }}>NET</span> <span style={{ color: T.offer }}>●</span> SYNC</span>
        {userEmail && (
          <button
            onClick={onSignOut}
            title="Se déconnecter"
            style={{
              background: 'none', border: `1px solid ${T.br1}`,
              color: T.fg3, fontFamily: 'var(--mono)', fontSize: 9.5,
              letterSpacing: '0.06em', padding: '2px 7px',
              cursor: 'pointer', borderRadius: 2,
            }}
          >OUT</button>
        )}
      </div>
    </div>
  );
}
