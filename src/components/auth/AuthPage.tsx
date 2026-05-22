import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { T } from '@/tokens';
import { useIsMobile } from '@/hooks/useIsMobile';
import { clearPendingTermsAcceptance, rememberPendingTermsAcceptance } from '@/hooks/useTermsAcceptance';

type Mode = 'login' | 'signup';

const inp = {
  width: '100%', background: T.bg0,
  border: `1px solid ${T.br1}`, color: T.fg0,
  fontFamily: 'var(--mono)', fontSize: 12,
  padding: '10px 12px', outline: 'none', height: 38,
} as const;

const lbl = {
  fontFamily: 'var(--mono)', fontSize: 9.5,
  color: T.fg3, letterSpacing: '0.1em',
  display: 'block', marginBottom: 6,
} as const;

const TERMS_SECTIONS = [
  {
    title: 'Purpose',
    body: 'Applytics is a private tool for tracking job applications, interviews, follow-ups, notes, and related CSV imports/exports.',
  },
  {
    title: 'Account',
    body: 'You are responsible for keeping your account credentials secure. Access is intended for invited or approved users only.',
  },
  {
    title: 'Data Stored',
    body: 'The app may store your email address, application details, company names, roles, contacts, links, notes, statuses, dates, interview information, settings, and imported CSV content.',
  },
  {
    title: 'CSV Import And Export',
    body: 'You are responsible for the files you import and export. Review CSV previews before importing, and avoid uploading information you do not want stored in the app.',
  },
  {
    title: 'Privacy',
    body: 'Application data is intended to remain private to each authenticated user. Data is stored in Supabase and protected by the project database configuration and access rules.',
  },
  {
    title: 'Deletion',
    body: 'If you need account or application data deleted, contact the project owner or remove the relevant records directly if you administer the Supabase project.',
  },
  {
    title: 'No Warranty',
    body: 'Applytics is provided as a personal project. It is offered as-is, without guarantees of availability, correctness, or fitness for a specific purpose.',
  },
  {
    title: 'Contact',
    body: 'For questions about access, privacy, or data deletion, contact the project owner.',
  },
];

// ── Mock data ────────────────────────────────────────────────────────────────

type S = 'DR' | 'SE' | 'FU' | 'IV' | 'OF' | 'RJ';

const APPS: { id: string; co: string; role: string; type: string; status: S; src: string; loc: string; sent: string; days: number; p: number }[] = [
  { id: 'a1b2c3d4', co: 'Stripe',        role: 'Software Engineer Intern',    type: 'stage',      status: 'IV', src: 'LinkedIn',  loc: 'Paris',     sent: '14d', days: 14, p: 1 },
  { id: 'e5f6a7b8', co: 'Mistral AI',    role: 'ML Engineer Intern',          type: 'stage',      status: 'IV', src: 'Direct',    loc: 'Paris',     sent: '9d',  days: 9,  p: 1 },
  { id: 'c9d0e1f2', co: 'Datadog',       role: 'SRE Internship',              type: 'stage',      status: 'FU', src: 'LinkedIn',  loc: 'Paris',     sent: '18d', days: 18, p: 2 },
  { id: 'a3b4c5d6', co: 'Criteo',        role: 'Backend Engineer Intern',     type: 'stage',      status: 'FU', src: 'WTTJ',      loc: 'Paris',     sent: '22d', days: 22, p: 3 },
  { id: 'e7f8a9b0', co: 'Doctolib',      role: 'Frontend Apprenticeship',     type: 'alternance', status: 'SE', src: 'LinkedIn',  loc: 'Levallois', sent: '5d',  days: 5,  p: 3 },
  { id: 'c1d2e3f4', co: 'Qonto',         role: 'Product Engineer Intern',     type: 'stage',      status: 'SE', src: 'Indeed',    loc: 'Paris',     sent: '4d',  days: 4,  p: 3 },
  { id: 'a5b6c7d8', co: 'Hugging Face',  role: 'ML Research Intern',          type: 'stage',      status: 'SE', src: 'Direct',    loc: 'Paris',     sent: '7d',  days: 7,  p: 1 },
  { id: 'e9f0a1b2', co: 'Sorare',        role: 'Full-stack Intern',           type: 'stage',      status: 'OF', src: 'Direct',    loc: 'Paris',     sent: '28d', days: 28, p: 1 },
  { id: 'c3d4e5f6', co: 'Algolia',       role: 'Backend Intern',              type: 'stage',      status: 'RJ', src: 'WTTJ',      loc: 'Paris',     sent: '21d', days: 21, p: 3 },
  { id: 'a7b8c9d0', co: 'Alan',          role: 'Data Engineer Intern',        type: 'alternance', status: 'DR', src: 'LinkedIn',  loc: 'Paris',     sent: '1d',  days: 1,  p: 2 },
  { id: 'e1f2a3b4', co: 'Ledger',        role: 'Security Intern',             type: 'stage',      status: 'DR', src: 'LinkedIn',  loc: 'Paris',     sent: 'now', days: 0,  p: 2 },
  { id: 'c5d6e7f8', co: 'BlaBlaCar',     role: 'iOS Engineer Intern',         type: 'stage',      status: 'DR', src: 'LinkedIn',  loc: 'Paris',     sent: '2d',  days: 2,  p: 3 },
];

const STATUS_COLOR: Record<S, string> = {
  DR: T.fg3, SE: T.sent, FU: T.followup, IV: T.interview, OF: T.offer, RJ: T.rejected,
};

const BOARD_COLS: { key: S; label: string }[] = [
  { key: 'DR', label: 'DRAFT' },
  { key: 'SE', label: 'SENT' },
  { key: 'FU', label: 'FOLLOWUP' },
  { key: 'IV', label: 'INTERVIEW' },
  { key: 'OF', label: 'OFFER' },
];

const total = APPS.length;
const sent  = APPS.filter(a => a.status !== 'DR').length;
const resp  = APPS.filter(a => ['FU','IV','OF','RJ'].includes(a.status)).length;
const ivs   = APPS.filter(a => ['IV','OF'].includes(a.status)).length;
const offers = APPS.filter(a => a.status === 'OF').length;

const DIST: { s: S; label: string; count: number }[] = [
  { s: 'DR', label: 'DRAFT',     count: APPS.filter(a => a.status === 'DR').length },
  { s: 'SE', label: 'SENT',      count: APPS.filter(a => a.status === 'SE').length },
  { s: 'FU', label: 'FOLLOWUP',  count: APPS.filter(a => a.status === 'FU').length },
  { s: 'IV', label: 'INTERVIEW', count: APPS.filter(a => a.status === 'IV').length },
  { s: 'OF', label: 'OFFER',     count: APPS.filter(a => a.status === 'OF').length },
  { s: 'RJ', label: 'REJECTED',  count: APPS.filter(a => a.status === 'RJ').length },
];

// ── Preview component ─────────────────────────────────────────────────────────

function StatusPill({ s }: { s: S }) {
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 10, padding: '1px 5px',
      background: `${STATUS_COLOR[s]}18`, color: STATUS_COLOR[s],
      letterSpacing: '0.06em',
    }}>{s}</span>
  );
}

function SectionHeader({ num, label, meta }: { num: string; label: string; meta: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.accent}`, paddingBottom: 8, marginBottom: 0 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.fg3, fontWeight: 500 }}>{num}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', color: T.accent }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3, letterSpacing: '0.1em' }}>{meta}</span>
    </div>
  );
}

function TermsLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        marginTop: 16,
        fontFamily: 'var(--mono)',
        fontSize: 10,
        color: T.fg3,
        cursor: 'pointer',
        letterSpacing: '0.04em',
      }}
    >
      Terms & Privacy
    </button>
  );
}

export function TermsPrivacyModal({ onClose, onAccept, accepting = false, error }: {
  onClose?: () => void;
  onAccept?: () => void;
  accepting?: boolean;
  error?: string | null;
}) {
  const close = onClose ?? (() => undefined);

  return (
    <div onClick={onClose ? close : undefined} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(8,9,11,.76)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      height: '100dvh',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(680px, 100%)',
        maxHeight: 'min(760px, calc(100dvh - 40px))',
        background: T.bg1,
        border: `1px solid ${T.br2}`,
        boxShadow: '0 24px 70px rgba(0,0,0,.6)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '13px 16px',
          borderBottom: `1px solid ${T.br0}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.accent, letterSpacing: '0.12em' }}>
            TERMS
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg0, letterSpacing: '0.08em' }}>
            TERMS & PRIVACY
          </span>
          <span style={{ flex: 1 }} />
          {onClose && <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: T.fg2,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}>x</button>}
        </div>

        <div style={{
          padding: 18,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          fontFamily: 'var(--mono)',
        }}>
          <div style={{
            color: T.fg2,
            fontSize: 10.5,
            lineHeight: 1.6,
            padding: '10px 12px',
            background: T.bg0,
            border: `1px solid ${T.br0}`,
          }}>
            Last updated: May 6, 2026. This notice is written for a private personal project, not a public commercial service.
          </div>

          {TERMS_SECTIONS.map(section => (
            <section key={section.title}>
              <h2 style={{
                margin: '0 0 6px',
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                color: T.fg0,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {section.title}
              </h2>
              <p style={{
                margin: 0,
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                color: T.fg2,
                lineHeight: 1.6,
              }}>
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {onAccept && (
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${T.br0}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            {error && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected }}>
                {error}
              </span>
            )}
            <span style={{ flex: 1 }} />
            <button
              onClick={onAccept}
              disabled={accepting}
              style={{
                background: accepting ? T.bg3 : T.accent,
                border: 'none',
                color: accepting ? T.fg3 : '#0a0b0d',
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '7px 14px',
                cursor: accepting ? 'not-allowed' : 'pointer',
              }}
            >
              {accepting ? 'ACCEPTING...' : 'ACCEPT TERMS'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({ inline }: { inline?: boolean }) {
  const frame = { background: T.bg1, border: `1px solid ${T.br1}`, borderTop: 'none', padding: 14 };
  return (
    <div style={{ position: 'relative', marginTop: inline ? 0 : 'auto', paddingTop: inline ? 0 : 64, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── DASH ── */}
      <div>
        <SectionHeader num="01" label="DASH" meta="overview · stats" />
        <div style={frame}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'SENT',        val: String(sent).padStart(3,'0'),  color: T.fg0 },
              { label: 'RESPONSE %',  val: `${((resp/sent)*100).toFixed(0)}%`, color: T.followup },
              { label: 'INTERVIEW %', val: `${((ivs/sent)*100).toFixed(0)}%`,  color: T.interview },
              { label: 'OFFERS',      val: String(offers).padStart(2,'0'), color: T.offer },
            ].map(k => (
              <div key={k.label} style={{ padding: '8px 10px', border: `1px solid ${T.br0}` }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: T.fg3, letterSpacing: '0.12em' }}>{k.label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 600, color: k.color, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{k.val}</div>
              </div>
            ))}
          </div>

          {inline ? (
            /* ── Mobile DASH: Today + Distribution stacked ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 01 Today */}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, letterSpacing: '0.12em', marginBottom: 10 }}>
                  <span style={{ color: T.accent, marginRight: 6 }}>01</span>TODAY
                </div>
                {/* Daily goal bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 4, background: T.br0, position: 'relative', marginBottom: 5 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: T.accent, width: '33%', boxShadow: `0 0 8px ${T.accent}66` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
                    <span>1/3 applications today</span>
                    <span style={{ color: T.followup }}>2 left</span>
                  </div>
                </div>
                {/* Followup items */}
                {[
                  { co: 'Send 2 new applications', sub: 'Reach your daily goal', tone: T.accent },
                  { co: 'Datadog', sub: 'No reply · 18d ago — follow-up', tone: T.followup },
                  { co: 'Criteo', sub: 'No reply · 22d ago — urgent follow-up', tone: T.rejected },
                ].map(item => (
                  <div key={item.co} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: T.bg2, border: `1px solid ${T.br0}`, marginBottom: 5, fontFamily: 'var(--mono)' }}>
                    <span style={{ width: 6, height: 6, background: item.tone, boxShadow: `0 0 8px ${item.tone}`, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 10.5, color: T.fg0 }}>{item.co}</div>
                      <div style={{ fontSize: 9.5, color: T.fg3, marginTop: 2 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* 02 Distribution */}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, letterSpacing: '0.12em', marginBottom: 8 }}>
                  <span style={{ color: T.accent, marginRight: 6 }}>02</span>PIPELINE DISTRIBUTION
                </div>
                {DIST.map(d => (
                  <div key={d.s} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 24px 34px', gap: 7, alignItems: 'center', padding: '3px 0', fontFamily: 'var(--mono)', fontSize: 10.5 }}>
                    <span style={{ color: T.fg2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[d.s], display: 'inline-block' }} />
                      {d.label}
                    </span>
                    <div style={{ height: 3, background: T.br0, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: STATUS_COLOR[d.s], width: `${(d.count/total)*100}%` }} />
                    </div>
                    <span style={{ color: T.fg0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
                    <span style={{ color: T.fg3, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{((d.count/total)*100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Desktop DASH: Pipeline + Distribution side by side ── */
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, letterSpacing: '0.12em', marginBottom: 7 }}>
                  <span style={{ color: T.accent, marginRight: 6 }}>01</span>PIPELINE · LAST 6
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
                  <thead><tr>{['COMPANY','ROLE','STATUS','SENT'].map((h,i) => (
                    <th key={h} style={{ textAlign: i===3?'right':'left', padding: '4px 8px', fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em', borderBottom: `1px solid ${T.br0}`, fontWeight: 500 }}>{h}</th>
                  ))}</tr></thead>
                  <tbody>{APPS.slice(0,6).map((a,i) => (
                    <tr key={a.id} style={{ background: i%2 ? T.bg1 : T.bg2 }}>
                      <td style={{ padding: '5px 8px', color: T.fg0, fontWeight: 500 }}>{a.co}</td>
                      <td style={{ padding: '5px 8px', color: T.fg2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
                      <td style={{ padding: '5px 8px' }}><StatusPill s={a.status} /></td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: a.days > 14 ? T.rejected : a.days > 7 ? T.followup : T.fg2, fontVariantNumeric: 'tabular-nums' }}>{a.sent}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2, letterSpacing: '0.12em', marginBottom: 7 }}>
                  <span style={{ color: T.accent, marginRight: 6 }}>02</span>DISTRIBUTION
                </div>
                {DIST.map(d => (
                  <div key={d.s} style={{ display: 'grid', gridTemplateColumns: '76px 1fr 24px 34px', gap: 7, alignItems: 'center', padding: '3px 0', fontFamily: 'var(--mono)', fontSize: 10.5 }}>
                    <span style={{ color: T.fg2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[d.s], display: 'inline-block' }} />
                      {d.label}
                    </span>
                    <div style={{ height: 3, background: T.br0, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: STATUS_COLOR[d.s], width: `${(d.count/total)*100}%` }} />
                    </div>
                    <span style={{ color: T.fg0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
                    <span style={{ color: T.fg3, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{((d.count/total)*100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── LIST ── */}
      <div>
        <SectionHeader num="02" label="LIST" meta={`${total} rows`} />
        <div style={{ ...frame, overflowX: 'auto' }}>
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 10,
            flexWrap: 'nowrap',
            minWidth: 'max-content',
          }}>
            {[
              { label: `ALL ${total}`, active: true, color: T.fg0 },
              { label: `DR ${DIST[0].count}`, active: false, color: T.fg3 },
              { label: `SE ${DIST[1].count}`, active: false, color: T.sent },
              { label: `FU ${DIST[2].count}`, active: false, color: T.followup },
              { label: `IV ${DIST[3].count}`, active: false, color: T.interview },
              { label: `OF ${DIST[4].count}`, active: false, color: T.offer },
              { label: `RJ ${DIST[5].count}`, active: false, color: T.rejected },
            ].map(f => (
              <div key={f.label} style={{
                fontFamily: 'var(--mono)', fontSize: 10,
                letterSpacing: '0.1em',
                padding: '4px 9px',
                border: `1px solid ${f.active ? T.accent : T.br1}`,
                color: f.active ? T.fg0 : f.color,
                background: f.active ? `${T.accent}12` : 'transparent',
                whiteSpace: 'nowrap',
                flex: '0 0 auto',
              }}>{f.label}</div>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <thead><tr>{['ID','COMPANY','TYPE','ROLE','STATUS','SOURCE','LOC','SENT','P'].map((h,i) => (
              <th key={h} style={{ textAlign: i>=7?'right':'left', padding: '4px 8px', fontSize: 9.5, color: T.fg3, letterSpacing: '0.1em', borderBottom: `1px solid ${T.br0}`, fontWeight: 500 }}>{h}</th>
            ))}</tr></thead>
            <tbody>{APPS.map((a,i) => (
              <tr key={a.id} style={{ background: i%2 ? T.bg1 : T.bg2 }}>
                <td style={{ padding: '5px 8px', color: T.fg3, fontSize: 10 }}>{a.id.slice(0,8)}</td>
                <td style={{ padding: '5px 8px', color: T.fg0, fontWeight: 500 }}>{a.co}</td>
                <td style={{ padding: '5px 8px', color: T.fg3, fontSize: 10 }}>{a.type}</td>
                <td style={{ padding: '5px 8px', color: T.fg2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
                <td style={{ padding: '5px 8px' }}><StatusPill s={a.status} /></td>
                <td style={{ padding: '5px 8px', color: T.fg2 }}>{a.src}</td>
                <td style={{ padding: '5px 8px', color: T.fg2 }}>{a.loc}</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: a.days > 14 ? T.rejected : a.days > 7 ? T.followup : T.fg2, fontVariantNumeric: 'tabular-nums' }}>{a.sent}</td>
                <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: a.p === 1 ? T.accent : T.fg3, background: a.p === 1 ? `${T.accent}18` : T.bg3, padding: '1px 5px' }}>P{a.p}</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* ── BOARD ── */}
      <div>
        <SectionHeader num="03" label="BOARD" meta="kanban" />
        <div style={{ ...frame, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, minWidth: 600 }}>
            {BOARD_COLS.map(col => {
              const cards = APPS.filter(a => a.status === col.key);
              return (
                <div key={col.key} style={{ background: T.bg2, border: `1px solid ${T.br0}`, padding: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 7, borderBottom: `1px solid ${T.br0}` }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: STATUS_COLOR[col.key], display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[col.key], display: 'inline-block' }} />
                      {col.label}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>{String(cards.length).padStart(2,'0')}</span>
                  </div>
                  {cards.map(a => (
                    <div key={a.id} style={{ background: T.bg1, border: `1px solid ${T.br0}`, borderLeft: `2px solid ${STATUS_COLOR[a.status]}`, padding: '7px 9px', marginBottom: 5, fontFamily: 'var(--mono)' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: T.fg0 }}>{a.co}</div>
                      <div style={{ fontSize: 9.5, color: T.fg2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 9, color: T.fg3 }}>
                        <span>{a.src.toUpperCase()}</span>
                        <span style={{ color: a.p === 1 ? T.accent : T.fg3 }}>P{a.p}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Auth page ─────────────────────────────────────────────────────────────────

export function AuthPage() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState(() => localStorage.getItem('applytics.email') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('applytics.email'));
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(null); setConfirm(''); };

  const submit = async () => {
    setError(null);
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match.'); return; }
    if (mode === 'signup' && password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    if (remember) localStorage.setItem('applytics.email', email);
    else localStorage.removeItem('applytics.email');
    setLoading(true);
    try {
      if (mode === 'signup') {
        rememberPendingTermsAcceptance();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { accepted_terms_at: new Date().toISOString() },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      if (mode === 'signup') clearPendingTermsAcceptance();
      setError(e instanceof Error ? e.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading
    && !!email
    && !!password
    && (mode === 'login' || (!!confirm && acceptedTerms));
  const canUseGoogle = !loading;
  const isMobile = useIsMobile(1100);
  const termsCheckbox = (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      fontFamily: 'var(--mono)',
      fontSize: 10.5,
      color: T.fg2,
      lineHeight: 1.45,
    }}>
      <input
        type="checkbox"
        checked={acceptedTerms}
        onChange={e => setAcceptedTerms(e.target.checked)}
        style={{ accentColor: T.accent, width: 13, height: 13, cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
      />
      <span>
        I accept the{' '}
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: T.accent,
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            cursor: 'pointer',
          }}
        >
          Terms & Privacy
        </button>
        .
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 40px',
        background: `
          radial-gradient(circle at 18% 18%, oklch(0.78 0.16 75 / .18), transparent 28%),
          radial-gradient(circle at 88% 76%, oklch(0.78 0.13 195 / .12), transparent 30%),
          linear-gradient(135deg, #08090b 0%, #0d0f13 48%, #101114 100%)
        `,
        position: 'relative',
      }}>
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: `linear-gradient(${T.br0} 1px, transparent 1px), linear-gradient(90deg, ${T.br0} 1px, transparent 1px)`,
          backgroundSize: '44px 44px', opacity: 0.28, pointerEvents: 'none',
        }} />
        {/* Brand */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span style={{ width: 28, height: 28, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0b0d', fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)' }}>A</span>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, color: T.fg0, letterSpacing: '-0.02em' }}>Applytics</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3, border: `1px solid ${T.br1}`, padding: '3px 7px', marginLeft: 4 }}>PRIVATE BETA</span>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: T.fg0, letterSpacing: '-0.02em' }}>Enter your workspace</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3, marginTop: 6 }}>Sign in or create an account</div>
          </div>

          <div style={{ background: T.bg1, border: `1px solid ${T.br1}` }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.br0}` }}>
              {(['login', 'signup'] as Mode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  flex: 1, padding: '13px 0', background: mode === m ? T.bg1 : T.bg2, border: 'none',
                  borderBottom: mode === m ? `2px solid ${T.accent}` : `2px solid transparent`,
                  color: mode === m ? T.fg0 : T.fg2,
                  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}>{m === 'login' ? 'Sign in' : 'Create account'}</button>
              ))}
            </div>

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="you@example.com" style={inp} autoFocus={!email} autoComplete="email" />
              </div>
              <div>
                <label style={lbl}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="••••••••" style={{ ...inp, paddingRight: 40 }}
                    autoFocus={!!email} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 38,
                    background: 'none', border: 'none', color: showPwd ? T.accent : T.fg3,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {showPwd ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {mode === 'signup' && (
                <div>
                  <label style={lbl}>CONFIRM PASSWORD</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="••••••••"
                    style={{ ...inp, borderColor: confirm && confirm !== password ? T.rejected : T.br1 }} />
                  {confirm && confirm !== password && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected, marginTop: 5 }}>Passwords do not match</div>
                  )}
                </div>
              )}
              {mode === 'login' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg2, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    style={{ accentColor: T.accent, width: 13, height: 13, cursor: 'pointer' }} />
                  Remember me
                </label>
              )}
              {mode === 'signup' && termsCheckbox}
              {error && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.rejected, padding: '9px 12px', background: `${T.rejected}12`, border: `1px solid ${T.rejected}30` }}>{error}</div>
              )}
              <button onClick={submit} disabled={!canSubmit} style={{
                background: canSubmit ? T.accent : T.bg3, border: 'none',
                color: canSubmit ? '#0a0b0d' : T.fg3,
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', padding: '13px',
                cursor: canSubmit ? 'pointer' : 'not-allowed', width: '100%',
              }}>{loading ? '…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: T.br1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: T.br1 }} />
              </div>
              <button disabled={!canUseGoogle} onClick={async () => {
                setError(null);
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                if (error) {
                  setError(error.message);
                }
              }} style={{
                background: canUseGoogle ? T.bg2 : T.bg3, border: `1px solid ${T.br2}`, color: canUseGoogle ? T.fg0 : T.fg3,
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
                letterSpacing: '0.06em', padding: '12px', cursor: canUseGoogle ? 'pointer' : 'not-allowed', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <TermsLink onClick={() => setTermsOpen(true)} />
          </div>
        </div>

        {/* Hero + preview */}
        <div style={{ position: 'relative', width: '100%', marginTop: 48 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.accent, letterSpacing: '0.16em', marginBottom: 14 }}>JOB SEARCH OPS</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 1.0, color: T.fg0, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Turn application chaos into a clean pipeline.
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7, color: T.fg2, margin: '0 0 32px' }}>
            Track every application, follow-up, and interview in one dense, distraction-free dashboard.
          </p>
          <Preview inline />
        </div>
        {termsOpen && <TermsPrivacyModal onClose={() => setTermsOpen(false)} />}
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh', minWidth: 1120,
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 480px',
      background: T.bg0, overflow: 'hidden',
    }}>
      {/* ── LEFT ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '38px 48px 44px',
        display: 'flex', flexDirection: 'column',
        background: `
          radial-gradient(circle at 18% 18%, oklch(0.78 0.16 75 / .18), transparent 28%),
          radial-gradient(circle at 88% 76%, oklch(0.78 0.13 195 / .12), transparent 30%),
          linear-gradient(135deg, #08090b 0%, #0d0f13 48%, #101114 100%)
        `,
        borderRight: `1px solid ${T.br0}`,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${T.br0} 1px, transparent 1px), linear-gradient(90deg, ${T.br0} 1px, transparent 1px)`,
          backgroundSize: '44px 44px', opacity: 0.28,
          maskImage: 'linear-gradient(90deg, black, transparent 85%)',
          pointerEvents: 'none',
        }} />

        {/* Brand */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0b0d', fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)' }}>A</span>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, color: T.fg0, letterSpacing: '-0.02em' }}>Applytics</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3, border: `1px solid ${T.br1}`, padding: '3px 7px', marginLeft: 4 }}>PRIVATE BETA</span>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', maxWidth: 760, marginTop: 80 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.accent, letterSpacing: '0.16em', marginBottom: 18 }}>JOB SEARCH OPS</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(42px, 4.8vw, 72px)', lineHeight: 0.95, color: T.fg0, letterSpacing: '-0.05em', margin: 0 }}>
            Turn application chaos<br />into a clean pipeline.
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7, color: T.fg2, maxWidth: 560, marginTop: 22 }}>
            Track every application, follow-up, and interview in one dense, distraction-free dashboard.
          </p>
        </div>

        {/* 3-tab preview */}
        <Preview />
      </div>

      {/* ── RIGHT (auth) ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: T.bg0 }}>
        <div style={{ marginBottom: 22, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: T.fg0, letterSpacing: '-0.02em' }}>Enter your workspace</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg3, marginTop: 6 }}>Sign in or create an account</div>
        </div>

        <div style={{ width: 400, background: T.bg1, border: `1px solid ${T.br1}`, boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.br0}` }}>
            {(['login', 'signup'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '13px 0', background: mode === m ? T.bg1 : T.bg2, border: 'none',
                borderBottom: mode === m ? `2px solid ${T.accent}` : `2px solid transparent`,
                color: mode === m ? T.fg0 : T.fg2,
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}>{m === 'login' ? 'Sign in' : 'Create account'}</button>
            ))}
          </div>

          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={lbl}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="you@example.com" style={inp} autoFocus={!email} autoComplete="email" />
            </div>

            <div>
              <label style={lbl}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••••" style={{ ...inp, paddingRight: 40 }}
                  autoFocus={!!email} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: 38,
                  background: 'none', border: 'none', color: showPwd ? T.accent : T.fg3,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {showPwd ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label style={lbl}>CONFIRM PASSWORD</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••••"
                  style={{ ...inp, borderColor: confirm && confirm !== password ? T.rejected : T.br1 }} />
                {confirm && confirm !== password && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected, marginTop: 5 }}>Passwords do not match</div>
                )}
              </div>
            )}

            {mode === 'login' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg2, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: T.accent, width: 13, height: 13, cursor: 'pointer' }} />
                Remember me
              </label>
            )}
            {mode === 'signup' && termsCheckbox}

            {error && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: T.rejected, padding: '9px 12px', background: `${T.rejected}12`, border: `1px solid ${T.rejected}30` }}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={!canSubmit} style={{
              background: canSubmit ? T.accent : T.bg3, border: 'none',
              color: canSubmit ? '#0a0b0d' : T.fg3,
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', padding: '11px',
              cursor: canSubmit ? 'pointer' : 'not-allowed', width: '100%', marginTop: 4,
            }}>{loading ? '…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: T.br1 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.br1 }} />
            </div>

            <button disabled={!canUseGoogle} onClick={async () => {
              setError(null);
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
              if (error) {
                setError(error.message);
              }
            }} style={{
              background: canUseGoogle ? T.bg2 : T.bg3, border: `1px solid ${T.br2}`, color: canUseGoogle ? T.fg0 : T.fg3,
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.06em', padding: '10px', cursor: canUseGoogle ? 'pointer' : 'not-allowed', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>
          </div>
        </div>

        <TermsLink onClick={() => setTermsOpen(true)} />
      </div>

      {termsOpen && <TermsPrivacyModal onClose={() => setTermsOpen(false)} />}
    </div>
  );
}
