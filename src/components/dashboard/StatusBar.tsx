import { T } from '@/tokens';
import { useIsMobile } from '@/hooks/useIsMobile';

interface StatusBarProps {
  filtered: number;
  total: number;
}

export function StatusBar({ filtered, total }: StatusBarProps) {
  const compact = useIsMobile(980);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      height: 22, flexShrink: 0, padding: '0 14px',
      background: T.bg1, borderTop: `1px solid ${T.br0}`,
      fontFamily: 'var(--mono)', fontSize: 10, color: T.fg2,
    }}>
      <span><span style={{ color: T.accent }}>●</span> READY</span>
      <span>ROWS <span style={{ color: T.fg0 }}>{filtered}</span>/{total}</span>
      <span style={{ flex: 1 }} />
      {!compact && (
        <>
          <span style={{ color: T.fg3 }}>↑↓ nav</span>
          <span style={{ color: T.fg3 }}>⏎ open</span>
          <span style={{ color: T.fg3 }}>N new</span>
          <span style={{ color: T.fg3 }}>F filter</span>
        </>
      )}
    </div>
  );
}
