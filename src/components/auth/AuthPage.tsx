import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { T } from '@/tokens';

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

export function AuthPage() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m); setError(null); setConfirm('');
  };

  const submit = async () => {
    setError(null);
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && !!email && !!password && (mode === 'login' || !!confirm);

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: T.bg0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <span style={{
          width: 28, height: 28, background: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0a0b0d', fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)',
        }}>A</span>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, color: T.fg0, letterSpacing: '-0.02em' }}>
          Applytics
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: 400, background: T.bg1,
        border: `1px solid ${T.br1}`,
        boxShadow: '0 24px 64px rgba(0,0,0,.5)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.br0}` }}>
          {(['login', 'signup'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '13px 0',
              background: mode === m ? T.bg1 : T.bg2,
              border: 'none',
              borderBottom: mode === m ? `2px solid ${T.accent}` : `2px solid transparent`,
              color: mode === m ? T.fg0 : T.fg2,
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="you@example.com" style={inp} autoFocus />
          </div>

          <div>
            <label style={lbl}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••" style={inp} />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={lbl}>CONFIRM PASSWORD</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="••••••••"
                style={{
                  ...inp,
                  borderColor: confirm && confirm !== password ? T.rejected : T.br1,
                }} />
              {confirm && confirm !== password && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.rejected, marginTop: 5 }}>
                  Passwords do not match
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, color: T.rejected,
              padding: '9px 12px', background: `${T.rejected}12`,
              border: `1px solid ${T.rejected}30`,
            }}>{error}</div>
          )}

          <button onClick={submit} disabled={!canSubmit} style={{
            background: canSubmit ? T.accent : T.bg3,
            border: 'none', color: canSubmit ? '#0a0b0d' : T.fg3,
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', padding: '11px',
            cursor: canSubmit ? 'pointer' : 'not-allowed', width: '100%',
            marginTop: 4,
          }}>
            {loading ? '…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
        Track your internship applications · v2.0
      </div>
    </div>
  );
}
