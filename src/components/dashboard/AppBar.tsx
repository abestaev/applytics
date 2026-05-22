import { useEffect, useRef, useState } from 'react';
import { T } from '@/tokens';

import { ToolBtn } from './Primitives';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { SyncStatus, ViewType } from '@/types/dashboard';

interface AppBarProps {
  view: ViewType;
  onView: (v: ViewType) => void;
  query: string;
  onQuery: (q: string) => void;
  onAdd: () => void;
  userEmail?: string;
  onSignOut: () => void;
  syncStatus: SyncStatus;
  mobileOnly?: boolean;
  onExportCsv?: () => void;
  onImportCsv?: () => void;
  onTermsPrivacy?: () => void;
}

const VIEWS: [string, ViewType][] = [
  ['DASH', 'dash'],
  ['LIST', 'list'],
  ['BOARD', 'board'],
  ['STATS', 'stats'],
];

const SYNC_META: Record<SyncStatus, { label: string; color: string; title: string }> = {
  loading: { label: 'LOAD', color: T.followup, title: 'Syncing' },
  synced:  { label: 'SYNC', color: T.offer, title: 'Synced' },
  offline: { label: 'OFF',  color: T.fg3, title: 'Offline' },
  error:   { label: 'ERR',  color: T.rejected, title: 'Sync error' },
};

export function AppBar({ view, onView, query, onQuery, onAdd, userEmail, onSignOut, syncStatus, mobileOnly = false, onExportCsv, onImportCsv, onTermsPrivacy }: AppBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const sync = SYNC_META[syncStatus];
  const views = mobileOnly ? VIEWS.filter(([, v]) => v === 'dash' || v === 'list') : VIEWS;
  const userHandle = userEmail?.split('@')[0];
  const compactDesktop = useIsMobile(1120) && !mobileOnly;

  if (mobileOnly) {
    return (
      <div style={{
        position: 'sticky', top: 0, zIndex: 80,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px',
        height: 52, flexShrink: 0,
        background: T.bg1, borderBottom: `1px solid ${T.br1}`,
        fontFamily: 'var(--mono)', fontSize: 11,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{
            width: 24, height: 24, background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0b0d', fontSize: 12, fontWeight: 800,
            flexShrink: 0,
          }}>A</span>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14,
            color: T.fg0, letterSpacing: '-0.01em', flexShrink: 0,
          }}>Applytics</span>
          {userHandle && (
            <span style={{
              color: T.fg2, fontSize: 10.5, minWidth: 0, marginLeft: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{userHandle}</span>
          )}
        </div>

        <button
          onClick={onAdd}
          aria-label="Create a new application"
          style={{
            background: T.accent,
            border: `1px solid ${T.accent}`,
            color: '#0a0b0d',
            fontFamily: 'var(--mono)', fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '7px 9px',
            cursor: 'pointer',
            flexShrink: 0,
            borderRadius: 2,
          }}
        >+ NEW</button>

        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label="Open navigation menu"
            style={{
              background: menuOpen ? T.bg3 : T.bg0,
              border: `1px solid ${menuOpen ? T.br2 : T.br1}`,
              color: T.fg0,
              fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 650,
              letterSpacing: '0.08em',
              padding: '7px 10px',
              cursor: 'pointer',
            }}
          >MENU</button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 43, right: 0,
              width: 150,
              background: T.bg1,
              border: `1px solid ${T.br2}`,
              boxShadow: '0 18px 40px rgba(0,0,0,.45)',
              zIndex: 120,
            }}>
              {views.map(([label, v]) => (
                <button
                  key={v}
                  onClick={() => {
                    onView(v);
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: view === v ? T.bg3 : 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${T.br0}`,
                    color: view === v ? T.accent : T.fg0,
                    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.08em',
                    padding: '11px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{label}</span>
                  {view === v && <span style={{ color: T.accent }}>ON</span>}
                </button>
              ))}
              {onTermsPrivacy && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onTermsPrivacy();
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${T.br0}`,
                    color: T.fg1,
                    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.08em',
                    padding: '11px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >TERMS</button>
              )}
              {userEmail && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: T.rejected,
                    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.08em',
                    padding: '11px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >OUT</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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
        {userEmail && !compactDesktop && (
          <>
            <span style={{ color: T.fg3 }}>·</span>
            <span style={{ color: T.fg2, fontSize: 10.5 }}>{userEmail}</span>
          </>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
        {views.map(([label, v]) => (
          <ToolBtn key={v} active={view === v} onClick={() => onView(v)}>{label}</ToolBtn>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {view === 'dash' ? (
        <button
          type="button"
          onClick={onImportCsv}
          title="Import CSV"
          style={{
            background: T.bg0,
            border: `1px solid ${T.br1}`,
            color: T.fg1,
            fontFamily: 'var(--mono)', fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '3px 10px',
            height: 24,
            cursor: 'pointer',
          }}
        >IMPORT CSV</button>
      ) : view === 'stats' ? (
        <button
          onClick={onExportCsv}
          style={{
            background: T.bg0,
            border: `1px solid ${T.br1}`,
            color: T.fg1,
            fontFamily: 'var(--mono)', fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '3px 10px',
            height: 24,
            cursor: 'pointer',
          }}
        >EXPORT CSV</button>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: T.bg0, border: `1px solid ${T.br1}`,
          padding: '3px 8px', minWidth: compactDesktop ? 160 : 220, height: 24,
          width: compactDesktop ? 180 : undefined,
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
          {!compactDesktop && <span style={{
            color: T.fg3, fontSize: 9, padding: '1px 4px',
            border: `1px solid ${T.br1}`, borderRadius: 2,
          }}>⌘K</span>}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={onAdd}
        style={{
          background: T.accent, border: 'none', color: '#0a0b0d',
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', padding: '3px 10px', height: 24,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          borderRadius: 2,
        }}
      >+ NEW</button>

      {/* Status */}
      <div style={{ display: 'flex', gap: compactDesktop ? 8 : 14, color: T.fg2, fontSize: 10.5, alignItems: 'center' }}>
        {!compactDesktop && <span><span style={{ color: T.fg3 }}>UTC</span> {time}</span>}
        <span title={sync.title}>
          <span style={{ color: T.fg3 }}>NET</span> <span style={{ color: sync.color }}>●</span> {sync.label}
        </span>
        {onTermsPrivacy && (
          <button
            onClick={onTermsPrivacy}
            title="Terms & Privacy"
            style={{
              background: 'none', border: `1px solid ${T.br1}`,
              color: T.fg3, fontFamily: 'var(--mono)', fontSize: 9.5,
              letterSpacing: '0.06em', padding: '2px 7px',
              cursor: 'pointer', borderRadius: 2,
            }}
          >TERMS</button>
        )}
        {userEmail && (
          <button
            onClick={onSignOut}
            title="Sign out"
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
