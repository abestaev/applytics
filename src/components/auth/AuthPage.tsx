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
  const [email, setEmail]       = useState(() => localStorage.getItem('applytics.email') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('applytics.email'));
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
    if (remember) localStorage.setItem('applytics.email', email);
    else localStorage.removeItem('applytics.email');
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
              placeholder="you@example.com" style={inp} autoFocus={!email} autoComplete="email" />
          </div>

          <div>
            <label style={lbl}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••" style={inp} autoFocus={!!email} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
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

          {mode === 'login' && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--mono)', fontSize: 10.5, color: T.fg2,
              cursor: 'pointer', userSelect: 'none',
            }}>
              <input
                type="checkbox" checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: T.accent, width: 13, height: 13, cursor: 'pointer' }}
              />
              Remember me
            </label>
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

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: T.br1 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: T.br1 }} />
          </div>

          {/* Google */}
          <button onClick={async () => {
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin },
            });
            if (error) setError(error.message);
          }} style={{
            background: T.bg2, border: `1px solid ${T.br2}`,
            color: T.fg0, fontFamily: 'var(--mono)', fontSize: 11,
            fontWeight: 500, letterSpacing: '0.06em',
            padding: '10px', cursor: 'pointer', width: '100%',
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

      <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
        Track your internship applications · v2.0
      </div>
    </div>
  );
}
