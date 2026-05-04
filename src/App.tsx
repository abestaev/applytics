import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { T } from '@/tokens';
import { AuthPage } from '@/components/auth/AuthPage';
import { AppBar } from '@/components/dashboard/AppBar';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ListView } from '@/components/dashboard/ListView';
import { BoardView } from '@/components/dashboard/BoardView';
import { StatsView } from '@/components/dashboard/StatsView';
import { AddModal } from '@/components/dashboard/AddModal';
import { useApplications } from '@/hooks/useApplications';
import type { ViewType } from '@/types/dashboard';

function AppShell({ user }: { user: User }) {
  const [view, setView]         = useState<ViewType>('dash');
  const [query, setQuery]       = useState('');
  const [addOpen, setAddOpen]   = useState(false);
  const [editApp, setEditApp]   = useState<import('@/types/dashboard').Application | undefined>(undefined);

  const { apps, loading, add, update, updateStatus, remove, syncStatus } = useApplications();

  const signOut = () => supabase.auth.signOut();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: T.bg0, overflow: 'hidden',
    }}>
      <AppBar
        view={view} onView={setView}
        query={query} onQuery={setQuery}
        onAdd={() => setAddOpen(true)}
        userEmail={user.email}
        onSignOut={signOut}
        syncStatus={syncStatus}
      />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 11, color: T.fg3, letterSpacing: '0.1em',
          }}>LOADING…</div>
        ) : (
          <>
            {view === 'dash'  && <DashboardView apps={apps} />}
            {view === 'list'  && <ListView apps={apps} query={query} onEdit={app => { setEditApp(app); setAddOpen(true); }} onDelete={remove} />}
            {view === 'board' && <BoardView apps={apps} onStatusChange={updateStatus} onAdd={() => { setEditApp(undefined); setAddOpen(true); }} />}
            {view === 'stats' && <StatsView apps={apps} />}
          </>
        )}
      </div>

      <StatusBar filtered={apps.length} total={apps.length} />

      <button
        onClick={() => setAddOpen(true)}
        title="New application (N)"
        style={{
          position: 'fixed', bottom: 36, right: 20,
          width: 36, height: 36, borderRadius: '50%',
          background: T.accent, border: 'none', color: '#0a0b0d',
          fontSize: 20, fontWeight: 700, lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${T.accent}66`, zIndex: 10,
        }}
      >+</button>

      <AddModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditApp(undefined); }}
        onAdd={async (v) => { await add(v); }}
        onUpdate={update}
        totalApps={apps.length}
        editApp={editApp}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser]       = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg0, fontFamily: 'var(--mono)', fontSize: 11,
        color: T.fg3, letterSpacing: '0.1em',
      }}>LOADING…</div>
    );
  }

  if (!user) return <AuthPage />;
  return <AppShell user={user} />;
}
