import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { T } from '@/tokens';
import { AuthPage, TermsPrivacyModal } from '@/components/auth/AuthPage';
import { AppBar } from '@/components/dashboard/AppBar';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ListView } from '@/components/dashboard/ListView';
import { BoardView } from '@/components/dashboard/BoardView';
import { StatsView } from '@/components/dashboard/StatsView';
import { AddModal } from '@/components/dashboard/AddModal';
import { ImportCsvModal } from '@/components/dashboard/ImportCsvModal';
import { useApplications } from '@/hooks/useApplications';
import type { NewApplication } from '@/hooks/useApplications';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Application, ViewType } from '@/types/dashboard';

const CSV_COLUMNS: { key: keyof Application; label: string }[] = [
  { key: 'id', label: 'id' },
  { key: 'company', label: 'company' },
  { key: 'role', label: 'role' },
  { key: 'status', label: 'status' },
  { key: 'source', label: 'source' },
  { key: 'loc', label: 'location' },
  { key: 'remote', label: 'mode' },
  { key: 'salary', label: 'salary' },
  { key: 'contact', label: 'contact' },
  { key: 'priority', label: 'priority' },
  { key: 'link', label: 'link' },
  { key: 'notes', label: 'notes' },
  { key: 'sentAt', label: 'sent_at' },
  { key: 'followupDate', label: 'followup_date' },
  { key: 'type', label: 'type' },
  { key: 'interviewStage', label: 'interview_stage' },
  { key: 'interviewDate', label: 'interview_date' },
];

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function AppShell({ user }: { user: User }) {
  const [view, setView]         = useState<ViewType>('dash');
  const [query, setQuery]       = useState('');
  const [addOpen, setAddOpen]   = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [editApp, setEditApp]   = useState<import('@/types/dashboard').Application | undefined>(undefined);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const activeView = isMobile && (view === 'board' || view === 'stats') ? 'dash' : view;

  const {
    accepted: termsAccepted,
    acceptTerms,
    error: termsError,
    loading: termsLoading,
  } = useTermsAcceptance(user.id);
  const { apps, loading, add, update, updateStatus, remove, syncStatus } = useApplications();

  const signOut = () => supabase.auth.signOut();
  const exportCsv = () => {
    const header = CSV_COLUMNS.map(c => csvCell(c.label)).join(',');
    const rows = apps.map(app => CSV_COLUMNS.map(c => csvCell(app[c.key])).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const importCsv = async (values: NewApplication[]) => {
    for (const value of values) {
      await add(value);
    }
  };
  const openApplicationInList = (id: string) => {
    setSelectedApplicationId(id);
    setQuery('');
    setView('list');
  };

  if (termsLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg0, fontFamily: 'var(--mono)', fontSize: 11,
        color: T.fg3, letterSpacing: '0.1em',
      }}>LOADING TERMS...</div>
    );
  }

  if (!termsAccepted) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0 }}>
        <TermsPrivacyModal
          onAccept={() => { void acceptTerms(); }}
          error={termsError}
        />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: isMobile ? '100dvh' : undefined,
      height: isMobile ? 'auto' : '100vh',
      background: T.bg0,
      overflow: isMobile ? 'visible' : 'hidden',
    }}>
      <AppBar
        view={activeView} onView={setView}
        query={query} onQuery={setQuery}
        onAdd={() => setAddOpen(true)}
        userEmail={user.email}
        onSignOut={signOut}
        syncStatus={syncStatus}
        mobileOnly={isMobile}
        onExportCsv={exportCsv}
        onImportCsv={() => setImportOpen(true)}
        onTermsPrivacy={() => setTermsOpen(true)}
      />

      <div style={{
        flex: 1,
        minHeight: isMobile ? undefined : 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {loading ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 11, color: T.fg3, letterSpacing: '0.1em',
          }}>LOADING…</div>
        ) : (
          <>
            {activeView === 'dash'  && <DashboardView apps={apps} onOpenApplication={openApplicationInList} />}
            {activeView === 'list'  && <ListView apps={apps} query={query} selectedApplicationId={selectedApplicationId} onEdit={app => { setEditApp(app); setAddOpen(true); }} onDelete={remove} />}
            {activeView === 'board' && <BoardView apps={apps} onStatusChange={updateStatus} onAdd={() => { setEditApp(undefined); setAddOpen(true); }} />}
            {activeView === 'stats' && <StatsView apps={apps} />}
          </>
        )}
      </div>

      <StatusBar filtered={apps.length} total={apps.length} />

      <AddModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditApp(undefined); }}
        onAdd={async (v) => { await add(v); }}
        onUpdate={update}
        totalApps={apps.length}
        editApp={editApp}
      />

      <ImportCsvModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={importCsv}
      />

      {termsOpen && <TermsPrivacyModal onClose={() => setTermsOpen(false)} />}
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
