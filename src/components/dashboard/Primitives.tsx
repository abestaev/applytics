import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { T } from '@/tokens';
import { STATUS_META } from '@/data/mockData';
import type { StatusType } from '@/types/dashboard';

type Tone = 'gray' | 'blue' | 'amber' | 'cyan' | 'lime' | 'red' | 'accent';
type MetricTone = 'fg0' | 'accent' | 'lime' | 'red' | 'cyan' | 'blue' | 'amber';

const PILL_TONES: Record<Tone, { fg: string; bg: string }> = {
  gray:   { fg: T.fg1,      bg: 'rgba(168,170,178,.10)' },
  blue:   { fg: T.sent,     bg: 'rgba(118,158,235,.13)' },
  amber:  { fg: T.followup, bg: 'rgba(229,178,90,.14)' },
  cyan:   { fg: T.interview,bg: 'rgba(110,205,219,.13)' },
  lime:   { fg: T.offer,    bg: 'rgba(150,210,90,.14)' },
  red:    { fg: T.rejected, bg: 'rgba(220,110,110,.14)' },
  accent: { fg: T.accent,   bg: 'rgba(229,178,90,.14)' },
};

export function Pill({ children, tone = 'gray', size = 'sm' }: {
  children: ReactNode;
  tone?: Tone;
  size?: 'xs' | 'sm';
}) {
  const t = PILL_TONES[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'xs' ? '1px 5px' : '2px 7px',
      fontSize: size === 'xs' ? 9.5 : 10.5,
      fontFamily: 'var(--mono)', fontWeight: 500, letterSpacing: '0.08em',
      color: t.fg, background: t.bg, borderRadius: 2, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function StatusDot({ status, size = 6 }: { status: StatusType; size?: number }) {
  const tone = STATUS_META[status]?.tone ?? T.fg2;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: tone, boxShadow: `0 0 8px ${tone}, 0 0 0 1px ${tone}33`,
      flexShrink: 0,
    }} />
  );
}

export function StatusTag({ status }: { status: StatusType }) {
  const m = STATUS_META[status];
  return <Pill tone={m.color}>{m.short}</Pill>;
}

export function CodeTag({ children, tone = 'gray' }: { children: ReactNode; tone?: string }) {
  const toneMap: Record<string, string> = {
    gray: T.fg2, accent: T.accent, lime: T.offer,
    red: T.rejected, cyan: T.interview, blue: T.sent, amber: T.followup,
  };
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.05em', color: toneMap[tone] ?? T.fg2,
    }}>{children}</span>
  );
}

export function Panel({ title, code, action, children, style, scroll = false, expand = false }: {
  title?: string;
  code?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  scroll?: boolean;
  expand?: boolean;
}) {
  return (
    <div style={{
      background: T.bg1, border: `1px solid ${T.br0}`,
      display: 'flex', flexDirection: 'column',
      minHeight: expand ? 'max-content' : 0,
      flexShrink: expand ? 0 : undefined,
      ...style,
    }}>
      {(title || code || action) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          borderBottom: `1px solid ${T.br0}`,
          background: T.bg2,
          minHeight: 32, flexShrink: 0,
        }}>
          {code && <CodeTag tone="accent">{code}</CodeTag>}
          {title && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.1em', color: T.fg0, textTransform: 'uppercase',
            }}>{title}</span>
          )}
          <span style={{ flex: 1 }} />
          {action}
        </div>
      )}
      <div style={expand ? { overflow: 'visible', flexShrink: 0 } : { flex: 1, minHeight: 0, overflow: scroll ? 'auto' : 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

export function Metric({ label, value, sub, tone = 'fg0' }: {
  label: string;
  value: string;
  sub?: string;
  tone?: MetricTone;
}) {
  const toneMap: Record<MetricTone, string> = {
    fg0: T.fg0, accent: T.accent, lime: T.offer,
    red: T.rejected, cyan: T.interview, blue: T.sent, amber: T.followup,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 500,
        letterSpacing: '0.12em', color: T.fg2, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500,
        fontVariantNumeric: 'tabular-nums', color: toneMap[tone], lineHeight: 1.05,
        letterSpacing: '-0.01em',
      }}>{value}</div>
      {sub && (
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2,
          whiteSpace: 'nowrap',
        }}>{sub}</div>
      )}
    </div>
  );
}

export function Sparkbars({ data, height = 32 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', gap: 1, height, alignItems: 'flex-end', width: '100%' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100 || 2}%`,
          minHeight: 1,
          background: v === 0 ? T.br1 : T.accent,
          opacity: v === 0 ? 0.4 : 0.4 + (v / max) * 0.6,
        }} />
      ))}
    </div>
  );
}

export function Heatmap({ data, cell = 9, gap = 2 }: { data: number[]; cell?: number; gap?: number }) {
  const max = Math.max(...data, 1);
  const cols = Math.ceil(data.length / 7);
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: `repeat(7, ${cell}px)`,
      gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
      gridAutoFlow: 'column',
      gap,
    }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: cell, height: cell,
          background: v === 0 ? T.br0 : T.accent,
          opacity: v === 0 ? 0.5 : 0.25 + (v / max) * 0.75,
          borderRadius: 1,
        }} />
      ))}
    </div>
  );
}

export function HBar({ value, max, tone = 'accent', height = 4 }: {
  value: number;
  max: number;
  tone?: string;
  height?: number;
}) {
  const toneMap: Record<string, string> = {
    accent: T.accent, sent: T.sent, followup: T.followup,
    interview: T.interview, offer: T.offer, rejected: T.rejected,
    draft: T.draft,
  };
  const color = toneMap[tone] ?? T.accent;
  return (
    <div style={{ height, background: T.br0, position: 'relative', flex: 1 }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${(value / max) * 100}%`,
        background: color,
        boxShadow: `0 0 8px ${color}66`,
      }} />
    </div>
  );
}

export function ToolBtn({ children, active, onClick, style }: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: 'none',
        border: `1px solid ${active || hovered ? T.br2 : 'transparent'}`,
        background: active ? T.bg3 : hovered ? T.bg2 : 'transparent',
        color: active || hovered ? T.fg0 : T.fg1,
        padding: '4px 9px', fontSize: 10.5, fontFamily: 'var(--mono)',
        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
        borderRadius: 2, transition: 'background 0.1s, border-color 0.1s, color 0.1s',
        ...style,
      }}
    >{children}</button>
  );
}
