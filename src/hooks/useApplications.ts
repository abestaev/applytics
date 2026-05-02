import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Application, StatusType } from '@/types/dashboard';

// DB row → Application (compute sentDays / lastDays from timestamps)
function rowToApp(row: Record<string, unknown>): Application {
  const now = Date.now();
  const toDays = (ts: unknown) =>
    ts ? Math.floor((now - new Date(ts as string).getTime()) / 86_400_000) : 0;

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
    priority:  row.priority as number,
    link:      row.link as string,
    notes:     row.notes as string,
  };
}

export type NewApplication = Omit<Application, 'id' | 'sentDays' | 'lastDays'> & {
  sentAt?: string;
};

export function useApplications() {
  const [apps, setApps]       = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setApps((data ?? []).map(rowToApp));
    setLoading(false);
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  const add = async (values: NewApplication) => {
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
        sent_at:       values.sentAt ?? null,
        last_event_at: values.sentAt ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    setApps(prev => [rowToApp(data), ...prev]);
    return rowToApp(data);
  };

  const update = async (id: string, patch: Partial<Omit<Application, 'id' | 'sentDays' | 'lastDays'>>) => {
    const dbPatch: Record<string, unknown> = { ...patch };
    if ('sentDays' in dbPatch) delete dbPatch.sentDays;
    if ('lastDays' in dbPatch) delete dbPatch.lastDays;

    // Si le statut quitte draft et que sent_at est null, on le set maintenant
    if (patch.status && patch.status !== 'draft') {
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
    if (error) throw new Error(error.message);
    setApps(prev => prev.map(a => a.id === id ? rowToApp(data) : a));
  };

  const updateStatus = async (id: string, status: StatusType) => {
    await update(id, { status });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setApps(prev => prev.filter(a => a.id !== id));
  };

  return { apps, setApps, loading, error, refetch: fetch, add, update, updateStatus, remove };
}
