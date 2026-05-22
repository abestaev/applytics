import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Application, AppType, InterviewStage, StatusType, SyncStatus } from '@/types/dashboard';

// DB row → Application (compute sentDays / lastDays from timestamps)
function rowToApp(row: Record<string, unknown>): Application {
  const now = Date.now();
  const toDays = (ts: unknown) =>
    ts ? (now - new Date(ts as string).getTime()) / 86_400_000 : 0;
  const priority = Number(row.priority);

  return {
    id:        row.id as string,
    company:   row.company as string,
    role:      row.role as string,
    status:    row.status as StatusType,
    source:    row.source as string,
    loc:       row.loc as string,
    remote:    row.remote as string,
    salary:    row.salary as string,
    sentDays:  toDays(row.sent_at),
    lastDays:  toDays(row.last_event_at),
    contact:   row.contact as string,
    priority:  [1, 2, 3].includes(priority) ? priority : 3,
    link:      row.link as string,
    notes:     row.notes as string,
    sentAt:         row.sent_at as string | undefined,
    followupDate:   row.followup_date as string | undefined,
    type:           (row.type as AppType) ?? 'stage',
    interviewStage: row.interview_stage as InterviewStage | undefined,
    interviewDate:  row.interview_date as string | undefined,
  };
}

export type NewApplication = Omit<Application, 'id' | 'sentDays' | 'lastDays'> & {
  sentAt?: string;
};

export function useApplications() {
  const [apps, setApps]       = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'loading',
  );

  const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

  useEffect(() => {
    const handleOnline = () => setSyncStatus(current => current === 'offline' ? 'synced' : current);
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSyncStatus(isOffline() ? 'offline' : 'loading');
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setSyncStatus(isOffline() ? 'offline' : 'error');
      setLoading(false);
      return;
    }
    setApps((data ?? []).map(rowToApp));
    setSyncStatus('synced');
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => { void fetch(); }, 0);
    return () => window.clearTimeout(id);
  }, [fetch]);

  const add = async (values: NewApplication) => {
    setSyncStatus(isOffline() ? 'offline' : 'loading');
    const { data, error } = await supabase
      .from('applications')
      .insert({
        company:       values.company,
        role:          values.role,
        status:        values.status,
        source:        values.source,
        loc:           values.loc,
        remote:        values.remote,
        salary:        values.salary,
        contact:       values.contact,
        priority:      values.priority,
        link:          values.link,
        notes:         values.notes,
        type:             values.type ?? 'stage',
        interview_stage:  values.interviewStage ?? null,
        interview_date:   values.interviewDate ?? null,
        followup_date:    values.followupDate ?? null,
        sent_at:          values.sentAt ?? null,
        last_event_at: values.sentAt ?? null,
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
      setSyncStatus(isOffline() ? 'offline' : 'error');
      throw new Error(error.message);
    }
    setApps(prev => [rowToApp(data), ...prev]);
    setSyncStatus('synced');
    return rowToApp(data);
  };

  const update = async (id: string, patch: Partial<Omit<Application, 'id' | 'sentDays' | 'lastDays'>>) => {
    setSyncStatus(isOffline() ? 'offline' : 'loading');
    const dbPatch: Record<string, unknown> = { ...patch };
    if ('sentDays' in dbPatch) delete dbPatch.sentDays;
    if ('lastDays' in dbPatch) delete dbPatch.lastDays;

    // Sent date: explicit value takes priority, otherwise auto-set when leaving draft
    if ('interviewStage' in dbPatch) {
      dbPatch.interview_stage = dbPatch.interviewStage || null;
      delete dbPatch.interviewStage;
    }
    if ('interviewDate' in dbPatch) {
      dbPatch.interview_date = dbPatch.interviewDate || null;
      delete dbPatch.interviewDate;
    }
    if ('followupDate' in dbPatch) {
      dbPatch.followup_date = dbPatch.followupDate || null;
      delete dbPatch.followupDate;
    }
    if ('sentAt' in dbPatch) {
      dbPatch.sent_at = dbPatch.sentAt || null;
      delete dbPatch.sentAt;
    } else if (patch.status && patch.status !== 'draft') {
      const current = apps.find(a => a.id === id);
      if (current && current.sentDays === 0) {
        dbPatch.sent_at = new Date().toISOString();
      }
    }
    // Mettre à jour last_event_at à chaque modification
    dbPatch.last_event_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('applications')
      .update(dbPatch)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      setSyncStatus(isOffline() ? 'offline' : 'error');
      throw new Error(error.message);
    }
    setApps(prev => prev.map(a => a.id === id ? rowToApp(data) : a));
    setSyncStatus('synced');
  };

  const updateStatus = async (id: string, status: StatusType) => {
    const patch: Partial<Application> = { status };
    if (status === 'followup') patch.followupDate = new Date().toISOString();
    await update(id, patch);
  };

  const remove = async (id: string) => {
    setSyncStatus(isOffline() ? 'offline' : 'loading');
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      setError(error.message);
      setSyncStatus(isOffline() ? 'offline' : 'error');
      throw new Error(error.message);
    }
    setApps(prev => prev.filter(a => a.id !== id));
    setSyncStatus('synced');
  };

  return { apps, setApps, loading, error, syncStatus, refetch: fetch, add, update, updateStatus, remove };
}
