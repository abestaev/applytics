import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const PENDING_TERMS_KEY = 'applytics.pendingTermsAccepted';

export function rememberPendingTermsAcceptance() {
  localStorage.setItem(PENDING_TERMS_KEY, '1');
}

export function clearPendingTermsAcceptance() {
  localStorage.removeItem(PENDING_TERMS_KEY);
}

export function useTermsAcceptance(userId: string) {
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptTerms = useCallback(async () => {
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        accepted_terms_at: now,
        updated_at: now,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      setError(upsertError.message);
      throw new Error(upsertError.message);
    }

    localStorage.removeItem(PENDING_TERMS_KEY);
    setAcceptedAt(now);
  }, [userId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('accepted_terms_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const accepted = typeof data?.accepted_terms_at === 'string'
        ? data.accepted_terms_at
        : null;
      setAcceptedAt(accepted);
      setLoading(false);

      if (!accepted && localStorage.getItem(PENDING_TERMS_KEY) === '1') {
        try {
          await acceptTerms();
        } catch {
          // The gate remains visible and displays the stored error.
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [acceptTerms, userId]);

  return {
    accepted: !!acceptedAt,
    acceptedAt,
    acceptTerms,
    error,
    loading,
  };
}
