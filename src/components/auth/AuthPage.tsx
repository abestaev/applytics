import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { T } from '@/tokens';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const [mode, setMode]       = useState<Mode>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: T.bg0,
    border: `1px solid ${T.br1}`, color: T.fg0,
    fontFamily: 'var(--mono)', fontSize: 12,
    padding: '8px 10px', outline: 'none', height: 34,
  } as const;

  const labelStyle = {
    fontFamily: 'var(--mono)', fontSize: 9.5,
    color: T.fg3, letterSpacing: '0.1em',
    display: 'block', marginBottom: 5,
  } as const;

  if (sent) {
    return (
      <div style={{
        height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: T.bg0,
      }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--mono)' }}>
          <div style={{ fontSize: 13, color: T.fg0, marginBottom: 8 }}>Vérifie tes emails</div>
          <div style={{ fontSize: 11, color: T.fg2 }}>Un lien de confirmation t'a été envoyé à <span style={{ color: T.accent }}>{email}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: T.bg0,
    }}>
      <div style={{
        width: 360, background: T.bg1,
        border: `1px solid ${T.br1}`,
        boxShadow: '0 20px 60px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${T.br0}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 18, height: 18, background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0b0d', fontSize: 11, fontWeight: 800, fontFamily: 'var(--mono)',
            flexShrink: 0,
          }}>A</span>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14,
            color: T.fg0, letterSpacing: '-0.01em',
          }}>Applytics</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: T.fg3 }}>
            {mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
          </span>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="toi@example.com"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>MOT DE PASSE</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10.5,
              color: T.rejected, padding: '8px 10px',
              background: `${T.rejected}12`, border: `1px solid ${T.rejected}30`,
            }}>{error}</div>
          )}

          <button
            onClick={submit}
            disabled={loading || !email || !password}
            style={{
              background: loading ? T.bg3 : T.accent,
              border: 'none', color: loading ? T.fg2 : '#0a0b0d',
              fontFamily: 'var(--mono)', fontSize: 11,
              fontWeight: 700, letterSpacing: '0.08em',
              padding: '9px', cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {loading ? '…' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER UN COMPTE'}
          </button>
        </div>

        {/* Footer toggle */}
        <div style={{
          padding: '12px 18px', borderTop: `1px solid ${T.br0}`,
          fontFamily: 'var(--mono)', fontSize: 10.5,
          color: T.fg3, textAlign: 'center',
        }}>
          {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            style={{
              background: 'none', border: 'none',
              color: T.accent, fontFamily: 'var(--mono)',
              fontSize: 10.5, cursor: 'pointer', padding: 0,
            }}
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
